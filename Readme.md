# Drupal Portfolio Showcase

This project includes a Drupal 11 custom theme and two custom modules based on the static portfolio design in the parent directory.

## Current platform versions

- Drupal core-recommended: `11.3.9`
- Drush: `13.7.3`

## Added

- Theme: `web/themes/custom/portfolio_showcase`
- Module: `web/modules/custom/portfolio_calendar`
- Blog Post content type config: `config/sync/node.type.blog_post.yml`

## Drupal 11 migration changes

- Removed incompatible packages from requirements:
  - `drupal/codesnippet`
  - `drupal/disable_enable_all_assign_block`
- Upgraded for Drupal 11 compatibility:
  - `drupal/gin` to `^5.0`
  - `drupal/gin_toolbar` to `^3.0`
  - `drupal/rdf` to `^3.0@beta`
  - `symfony/webpack-encore-bundle` to `^2.4`

## What was implemented

- `portfolio_showcase` reproduces the static portfolio visual style on the Drupal front page using a locally compiled Tailwind CSS build.
- The GitHub contribution calendar was moved into `portfolio_calendar` as a reusable Drupal block plugin with a server-side data controller.
- `portfolio_calendar` includes an admin settings UI for two GitHub usernames and token storage.
- The theme preprocesses the front page and renders the `portfolio_calendar_pulse_block` automatically when the module is enabled.
- A Blog Post content type (`blog_post`) with matching Twig templates for full and teaser display.

## Blog Post content type

Machine name: `blog_post`

| Field | Machine name | Type |
|-------|-------------|------|
| Title | `title` | Node title |
| Body | `body` | Text (formatted, long) |
| Featured Image | `field_featured_image` | Image (direct file) |
| Summary / Excerpt | `field_excerpt` | Text (plain, long) |
| Tags | `field_tags` | Taxonomy term reference (Tags vocabulary) |
| Published Date | `field_published_date` | Date |
| Reading Time | `field_reading_time` | Integer (minutes) |
| External URL | `field_external_url` | Link (optional) |

### Templates

- `node--blog-post.html.twig` — full page view matching the static `blog-post.html` design
- `node--blog-post--teaser.html.twig` — card-style teaser matching the `blog.html` listing cards

### Import config

The content type configuration files are in `config/sync/`. To import:

```bash
ddev drush cim -y --partial --source=config/sync
```

Or enable the modules needed and import step by step if partial import fails:

```bash
ddev drush en image link datetime text taxonomy -y
ddev drush config:import --partial -y
```

If using the full config sync, run:

```bash
ddev drush cim -y
ddev drush updatedb -y
ddev drush cr
```

### Create a blog View

For the blog listing page at `/blog`:

1. Go to `Admin > Structure > Views > Add view`
2. Name: `Blog`
3. Show: `Content` of type `Blog Post` sorted by `Published Date (desc)`
4. Create a page at `/blog` with a teaser display
5. Use the `portfolio_showcase` theme for the page

The theme includes `templates/views/views-view--blog.html.twig` if you name the View machine name `blog`.

## Configure GitHub accounts and tokens

- Go to `Admin > Configuration > Web services > Portfolio Calendar`
- Path: `/admin/config/services/portfolio-calendar`
- Store usernames in config and tokens in state.

## Enable in Drupal

```bash
ddev drush en portfolio_calendar -y
ddev drush theme:enable portfolio_showcase -y
ddev drush config:set system.theme default portfolio_showcase -y
ddev drush cr
```

## Build Tailwind CSS

If you modify templates and need to rebuild Tailwind classes:

```bash
npm run build
```

## Validation commands used

```bash
composer validate --no-check-publish
composer audit
php -l web/themes/custom/portfolio_showcase/portfolio_showcase.theme
php -l web/modules/custom/portfolio_calendar/src/Plugin/Block/PortfolioCalendarBlock.php
php -l web/modules/custom/portfolio_calendar/src/Form/PortfolioCalendarSettingsForm.php
php -l web/modules/custom/portfolio_calendar/src/Controller/PortfolioCalendarController.php
php -r "require 'vendor/autoload.php'; \$files=['web/themes/custom/portfolio_showcase/portfolio_showcase.info.yml','web/themes/custom/portfolio_showcase/portfolio_showcase.libraries.yml','web/modules/custom/portfolio_calendar/portfolio_calendar.info.yml','web/modules/custom/portfolio_calendar/portfolio_calendar.libraries.yml','web/modules/custom/portfolio_calendar/portfolio_calendar.routing.yml','web/modules/custom/portfolio_calendar/portfolio_calendar.links.menu.yml']; foreach (\$files as \$file) { Symfony\\Component\\Yaml\\Yaml::parseFile(\$file); echo 'OK ' . \$file . PHP_EOL; }"
node --check web/themes/custom/portfolio_showcase/assets/js/theme-init.js
node --check web/themes/custom/portfolio_showcase/assets/js/theme-toggle.js
node --check web/themes/custom/portfolio_showcase/assets/js/portfolio-showcase.js
node --check web/modules/custom/portfolio_calendar/js/portfolio_calendar.js
ddev drush updatedb -y
ddev drush cr
```
