<?php

/**
 * @file
 * Includes the autoload_runtime created by the Symfony Runtime component.
 *
 * This file is committed to the repository (like web/autoload.php) so that the
 * drupal-scaffold plugin does not regenerate it with default content on every
 * composer install. It applies the documented Drupal 11.4.x workaround for the
 * "Redirects to external URLs are not allowed by default" regression when the
 * site is served from a subdirectory docroot (relocated web root).
 *
 * @see https://www.drupal.org/docs/getting-started/system-requirements/relocated-web-root-on-shared-hosting
 * @see https://www.drupal.org/project/drupal/issues/2612160
 * @see https://www.drupal.org/project/drupal/issues/3569379
 *
 * @see composer.json
 * @see index.php
 * @see core/install.php
 * @see core/rebuild.php
 */

use Drupal\Core\Runtime\DrupalRuntime;

// BEGIN DRUPAL_WEBROOT WORKAROUND
// Drupal 11.4.x changed request handling so that sites served from a
// subdirectory docroot (e.g. web/) have their internal redirects misclassified
// as external, which makes RedirectResponseSubscriber throw
// "Redirects to external URLs are not allowed by default". Stripping the
// webroot segment from SCRIPT_NAME before Symfony builds the Request restores
// correct base_url/base_path handling so internal redirects are recognised as
// local again. This must run before vendor/autoload_runtime.php boots the
// runtime.
//
// The webroot segment is taken from the DRUPAL_WEBROOT environment variable
// (Apache SetEnv / nginx fastcgi_param) if the web server passes it through to
// PHP. If it is not available (e.g. PHP-FPM does not forward SetEnv from
// .htaccess), it is auto-detected from this file's own location: this file
// lives in the web root, so its directory name is the webroot segment.
$webroot = getenv('DRUPAL_WEBROOT');
if ($webroot === FALSE && isset($_SERVER['DRUPAL_WEBROOT'])) {
  $webroot = $_SERVER['DRUPAL_WEBROOT'];
}
if ($webroot === FALSE || $webroot === '') {
  // Auto-detect the webroot segment from this file's directory (e.g. 'web').
  $webroot = '/' . basename(__DIR__);
}
if ($webroot !== '' && isset($_SERVER['SCRIPT_NAME']) && str_starts_with($_SERVER['SCRIPT_NAME'], $webroot . '/')) {
  $_SERVER['SCRIPT_NAME'] = substr($_SERVER['SCRIPT_NAME'], strlen($webroot));
}
// END DRUPAL_WEBROOT WORKAROUND

// By default, the symfony/runtime component would load SymfonyRuntime as its
// runtime. However, Drupal's Kernel has a lot of runtime components that it
// expects to be prepared. Thus, we default Drupal applications to DrupalRuntime
// instead to make this easily accessible.
$_ENV['APP_RUNTIME'] ??= $_SERVER['APP_RUNTIME'] ?? DrupalRuntime::class;
return require __DIR__ . '/../vendor/autoload_runtime.php';
