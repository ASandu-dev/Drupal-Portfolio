<?php

declare(strict_types=1);

namespace Drupal\portfolio_calendar\Controller;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\State\StateInterface;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Returns GitHub activity payloads for the portfolio calendar.
 */
final class PortfolioCalendarController implements ContainerInjectionInterface {

  private const CACHE_TTL_SECONDS = 21600;

  private const TOTAL_DAYS = 371;

  private const CACHE_TAG = 'portfolio_calendar_activity';

  public function __construct(
    private readonly ConfigFactoryInterface $configFactory,
    private readonly StateInterface $state,
    private readonly ClientInterface $httpClient,
    private readonly CacheBackendInterface $cache,
  ) {
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    return new self(
      $container->get('config.factory'),
      $container->get('state'),
      $container->get('http_client'),
      $container->get('cache.default'),
    );
  }

  /**
   * Builds and returns calendar activity JSON.
   */
  public function activity(): JsonResponse {
    $config = $this->configFactory->get('portfolio_calendar.settings');
    $accounts = [
      [
        'username' => trim((string) ($config->get('github_username_primary') ?: 'ASandu-dev')),
        'token' => (string) $this->state->get('portfolio_calendar.github_token_primary', ''),
      ],
      [
        'username' => trim((string) ($config->get('github_username_secondary') ?: 'CMAndrei')),
        'token' => (string) $this->state->get('portfolio_calendar.github_token_secondary', ''),
      ],
    ];

    $tokenFingerprint = array_map(static function (array $account): string {
      return $account['token'] === '' ? '' : hash('sha256', $account['token']);
    }, $accounts);

    $cacheId = 'portfolio_calendar:activity:' . hash('sha256', Json::encode([
      'usernames' => array_column($accounts, 'username'),
      'tokens' => $tokenFingerprint,
    ]));

    $cached = $this->cache->get($cacheId);
    if ($cached) {
      return new JsonResponse($cached->data);
    }

    [$fromDate, $toDate, $dates] = $this->buildDateRange();

    $dayMap = [];
    foreach ($dates as $date) {
      $dayMap[$date] = [
        'date' => $date,
        'total' => 0,
        'accounts' => [],
      ];

      foreach ($accounts as $account) {
        if ($account['username'] !== '') {
          $dayMap[$date]['accounts'][$account['username']] = 0;
        }
      }
    }

    $warnings = [];
    $errors = [];
    $publicFallbackUsed = FALSE;

    foreach ($accounts as $account) {
      if ($account['username'] === '') {
        continue;
      }

      $contributions = [];
      try {
        if ($account['token'] === '') {
          throw new \RuntimeException('No token configured.');
        }

        $contributions = $this->fetchGraphqlContributions(
          $account['username'],
          $account['token'],
          $fromDate,
          $toDate,
        );
      }
      catch (\Throwable $exception) {
        try {
          $contributions = $this->fetchPublicContributions($account['username']);
          $warnings[] = 'Using public fallback data for ' . $account['username'] . ': ' . $exception->getMessage();
          $publicFallbackUsed = TRUE;
        }
        catch (\Throwable $fallbackException) {
          $errors[] = 'Could not load activity for ' . $account['username'] . ': ' . $fallbackException->getMessage();
          continue;
        }
      }

      foreach ($contributions as $date => $count) {
        if (!isset($dayMap[$date])) {
          continue;
        }

        $dayMap[$date]['accounts'][$account['username']] = (int) $count;
      }
    }

    foreach ($dayMap as &$day) {
      $day['total'] = array_sum($day['accounts']);
    }
    unset($day);

    $payload = [
      'meta' => [
        'generatedAt' => gmdate('c'),
        'source' => $publicFallbackUsed ? 'github-graphql-with-public-fallback' : 'github-graphql-live',
        'usernames' => array_values(array_filter(array_column($accounts, 'username'))),
        'publicFallbackUsed' => $publicFallbackUsed,
        'cacheTtlSeconds' => self::CACHE_TTL_SECONDS,
        'warnings' => $warnings,
        'errors' => $errors,
      ],
      'days' => array_values($dayMap),
    ];

    $this->cache->set(
      $cacheId,
      $payload,
      time() + self::CACHE_TTL_SECONDS,
      [self::CACHE_TAG],
    );

    return new JsonResponse($payload);
  }

  /**
   * Fetches contribution days from GitHub GraphQL API.
   *
   * @return array<string, int>
   *   Date keyed contribution counts.
   */
  private function fetchGraphqlContributions(string $username, string $token, string $fromDate, string $toDate): array {
    $query = <<<'GRAPHQL'
query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
GRAPHQL;

    try {
      $response = $this->httpClient->request('POST', 'https://api.github.com/graphql', [
        'headers' => [
          'Authorization' => 'Bearer ' . $token,
          'Accept' => 'application/vnd.github+json',
          'User-Agent' => 'Drupal-Portfolio-Calendar',
        ],
        'json' => [
          'query' => $query,
          'variables' => [
            'login' => $username,
            'from' => $fromDate,
            'to' => $toDate,
          ],
        ],
        'timeout' => 20,
      ]);
    }
    catch (GuzzleException $exception) {
      throw new \RuntimeException('GraphQL request failed.', 0, $exception);
    }

    $payload = Json::decode((string) $response->getBody());
    if (!is_array($payload)) {
      throw new \RuntimeException('GraphQL response was not valid JSON.');
    }

    if (!empty($payload['errors'])) {
      throw new \RuntimeException('GraphQL returned API errors.');
    }

    $weeks = $payload['data']['user']['contributionsCollection']['contributionCalendar']['weeks'] ?? NULL;
    if (!is_array($weeks)) {
      throw new \RuntimeException('GraphQL response did not include contribution weeks.');
    }

    $result = [];
    foreach ($weeks as $week) {
      foreach ($week['contributionDays'] ?? [] as $day) {
        if (!isset($day['date'])) {
          continue;
        }

        $result[(string) $day['date']] = (int) ($day['contributionCount'] ?? 0);
      }
    }

    return $result;
  }

  /**
   * Fetches contribution days from public fallback API.
   *
   * @return array<string, int>
   *   Date keyed contribution counts.
   */
  private function fetchPublicContributions(string $username): array {
    try {
      $response = $this->httpClient->request(
        'GET',
        'https://github-contributions-api.jogruber.de/v4/' . rawurlencode($username) . '?y=last',
        [
          'headers' => [
            'Accept' => 'application/json',
            'User-Agent' => 'Drupal-Portfolio-Calendar',
          ],
          'timeout' => 20,
        ],
      );
    }
    catch (GuzzleException $exception) {
      throw new \RuntimeException('Public fallback API request failed.', 0, $exception);
    }

    $payload = Json::decode((string) $response->getBody());
    if (!is_array($payload)) {
      throw new \RuntimeException('Public fallback response was not valid JSON.');
    }

    $contributions = $payload['contributions'] ?? NULL;
    if (!is_array($contributions)) {
      throw new \RuntimeException('Public fallback response did not include contributions.');
    }

    $result = [];
    foreach ($contributions as $entry) {
      if (!isset($entry['date'])) {
        continue;
      }

      $result[(string) $entry['date']] = (int) ($entry['count'] ?? 0);
    }

    return $result;
  }

  /**
   * Builds the rolling date range used by the calendar.
   *
   * @return array{0: string, 1: string, 2: string[]}
   *   GraphQL from/to values and day key list.
   */
  private function buildDateRange(): array {
    $today = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
    $to = $today->setTime(23, 59, 59);
    $from = $today
      ->sub(new \DateInterval('P' . (self::TOTAL_DAYS - 1) . 'D'))
      ->setTime(0, 0, 0);

    $dates = [];
    $cursor = $from;
    for ($index = 0; $index < self::TOTAL_DAYS; $index++) {
      $dates[] = $cursor->format('Y-m-d');
      $cursor = $cursor->add(new \DateInterval('P1D'));
    }

    return [$from->format('c'), $to->format('c'), $dates];
  }

}
