<?php

declare(strict_types=1);

namespace Drupal\portfolio_calendar\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Url;

/**
 * Provides a portfolio GitHub calendar block.
 *
 * @Block(
 *   id = "portfolio_calendar_pulse_block",
 *   admin_label = @Translation("Portfolio Calendar: Development Pulse"),
 *   category = @Translation("Portfolio")
 * )
 */
final class PortfolioCalendarBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    return [
      '#type' => 'container',
      '#attributes' => [
        'id' => 'github-merged-activity',
      ],
      '#attached' => [
        'library' => [
          'portfolio_calendar/calendar',
        ],
        'drupalSettings' => [
          'portfolioCalendar' => [
            'endpoint' => Url::fromRoute('portfolio_calendar.activity')->toString(),
          ],
        ],
      ],
    ];
  }

}
