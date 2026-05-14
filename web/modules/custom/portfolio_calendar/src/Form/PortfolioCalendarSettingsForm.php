<?php

declare(strict_types=1);

namespace Drupal\portfolio_calendar\Form;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\State\StateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Settings form for Portfolio Calendar.
 */
final class PortfolioCalendarSettingsForm extends ConfigFormBase {

  private StateInterface $state;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): self {
    $instance = parent::create($container);
    $instance->state = $container->get('state');
    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'portfolio_calendar_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['portfolio_calendar.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    $config = $this->config('portfolio_calendar.settings');

    $form['intro'] = [
      '#type' => 'item',
      '#markup' => (string) $this->t('Store GitHub usernames in config and Personal Access Tokens in state. Tokens are not exported with configuration.'),
    ];

    $form['account_primary'] = [
      '#type' => 'details',
      '#title' => $this->t('Primary account'),
      '#open' => TRUE,
    ];

    $form['account_primary']['github_username_primary'] = [
      '#type' => 'textfield',
      '#title' => $this->t('GitHub username'),
      '#required' => TRUE,
      '#default_value' => $config->get('github_username_primary') ?: 'ASandu-dev',
    ];

    $form['account_primary']['github_token_primary'] = [
      '#type' => 'password',
      '#title' => $this->t('Personal access token'),
      '#description' => $this->t('Leave blank to keep the current stored token. Use a GitHub token that can read contribution data.'),
    ];

    $form['account_primary']['github_token_primary_status'] = [
      '#type' => 'item',
      '#title' => $this->t('Token status'),
      '#markup' => $this->state->get('portfolio_calendar.github_token_primary') ? (string) $this->t('Stored') : (string) $this->t('Not stored'),
    ];

    $form['account_primary']['github_token_primary_clear'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Remove stored token for primary account'),
    ];

    $form['account_secondary'] = [
      '#type' => 'details',
      '#title' => $this->t('Secondary account'),
      '#open' => TRUE,
    ];

    $form['account_secondary']['github_username_secondary'] = [
      '#type' => 'textfield',
      '#title' => $this->t('GitHub username'),
      '#required' => TRUE,
      '#default_value' => $config->get('github_username_secondary') ?: 'CMAndrei',
    ];

    $form['account_secondary']['github_token_secondary'] = [
      '#type' => 'password',
      '#title' => $this->t('Personal access token'),
      '#description' => $this->t('Leave blank to keep the current stored token. Use a GitHub token that can read contribution data.'),
    ];

    $form['account_secondary']['github_token_secondary_status'] = [
      '#type' => 'item',
      '#title' => $this->t('Token status'),
      '#markup' => $this->state->get('portfolio_calendar.github_token_secondary') ? (string) $this->t('Stored') : (string) $this->t('Not stored'),
    ];

    $form['account_secondary']['github_token_secondary_clear'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Remove stored token for secondary account'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $primary = trim((string) $form_state->getValue('github_username_primary'));
    $secondary = trim((string) $form_state->getValue('github_username_secondary'));

    if (!preg_match('/^[A-Za-z0-9-]+$/', $primary)) {
      $form_state->setErrorByName('github_username_primary', $this->t('Primary username is not a valid GitHub username.'));
    }

    if (!preg_match('/^[A-Za-z0-9-]+$/', $secondary)) {
      $form_state->setErrorByName('github_username_secondary', $this->t('Secondary username is not a valid GitHub username.'));
    }

    if (strcasecmp($primary, $secondary) === 0) {
      $form_state->setErrorByName('github_username_secondary', $this->t('Primary and secondary usernames must be different.'));
    }

    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $primaryUsername = trim((string) $form_state->getValue('github_username_primary'));
    $secondaryUsername = trim((string) $form_state->getValue('github_username_secondary'));

    $this->configFactory->getEditable('portfolio_calendar.settings')
      ->set('github_username_primary', $primaryUsername)
      ->set('github_username_secondary', $secondaryUsername)
      ->save();

    $primaryToken = trim((string) $form_state->getValue('github_token_primary'));
    $secondaryToken = trim((string) $form_state->getValue('github_token_secondary'));

    if ($primaryToken !== '') {
      $this->state->set('portfolio_calendar.github_token_primary', $primaryToken);
    }
    elseif ((bool) $form_state->getValue('github_token_primary_clear')) {
      $this->state->delete('portfolio_calendar.github_token_primary');
    }

    if ($secondaryToken !== '') {
      $this->state->set('portfolio_calendar.github_token_secondary', $secondaryToken);
    }
    elseif ((bool) $form_state->getValue('github_token_secondary_clear')) {
      $this->state->delete('portfolio_calendar.github_token_secondary');
    }

    Cache::invalidateTags(['portfolio_calendar_activity']);

    parent::submitForm($form, $form_state);
  }

}
