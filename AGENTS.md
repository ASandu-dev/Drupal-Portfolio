# Drupal Portfolio Showcase

Personal portfolio website for Andrei Sandu (Web Architect & Cybersecurity Enthusiast). Drupal 11 site with custom theme, GitHub contribution calendar, and blog ("Intelligence Reports").

## Tech Stack

- **CMS:** Drupal 11.3.x (`drupal/core: ^11.3.12`)
- **PHP:** 8.3 (DDEV + CI)
- **Database:** MariaDB 10.11 (DDEV)
- **Web server:** nginx-fpm (DDEV)
- **Drush:** ^13.7
- **Frontend:** Tailwind CSS 3.1.8 + `@tailwindcss/typography`, `darkMode: 'class'`
- **Fonts:** Inter + Fira Code (Google Fonts)
- **Local dev:** DDEV (`type: drupal9` — stale but functional)
- **CI:** GitHub Actions (PHP 8.3 + Node 22)
- **Admin theme:** Gin + Gin Toolbar
- **Contrib modules:** pathauto, metatag, scheduler, markdown, csp, google_analytics, fontawesome, addtoany, rename_admin_paths, scss_compiler, workflow

## Commands

```bash
# DDEV
ddev start                    # start local dev environment
ddev stop                     # stop
ddev drush cim -y             # import config sync
ddev drush cim -y --partial --source=config/sync  # partial import
ddev drush updatedb -y        # run database updates
ddev drush cr                 # clear cache
ddev drush dev                # enable devel
# Tailwind (build CSS into theme)
npm run build                 # tailwind CLI minify → portfolio-showcase.tailwind.css
npm run watch                 # tailwind watch mode
# Article conversion
php scripts/convert-articles.php  # MD → HTML for CKEditor import
```

## Architecture

```
web/
├── themes/custom/
│   └── portfolio_showcase/          # the ONLY custom theme
│       ├── portfolio_showcase.info.yml
│       ├── portfolio_showcase.libraries.yml    # global CSS/JS libraries
│       ├── portfolio_showcase.theme            # preprocess hooks
│       ├── tailwind.config.js                  # ACTIVE Tailwind config
│       ├── src/tailwind.input.css              # @tailwind base/components/utilities
│       ├── assets/
│       │   ├── css/
│       │   │   ├── portfolio-showcase.tailwind.css  # compiled output (committed)
│       │   │   ├── portfolio-showcase.css           # hand-written helpers (.glass)
│       │   │   └── ckeditor5-basic-html.css
│       │   └── js/
│       │       ├── theme-init.js               # IIFE — applies theme before paint
│       │       ├── theme-toggle.js             # dark/light toggle + localStorage
│       │       └── portfolio-showcase.js       # copy-email, mobile menu
│       └── templates/
│           ├── page.html.twig                  # default page wrapper
│           ├── page--front.html.twig           # landing page (hero, skills, projects, calendar)
│           ├── page--user--login.html.twig     # styled login
│           ├── content/node--blog-post.html.twig
│           ├── content/node--blog-post--teaser.html.twig
│           ├── content/node--project--teaser.html.twig
│           └── views/views-view--blog.html.twig
├── modules/custom/
│   └── portfolio_calendar/           # the ONLY custom module
│       ├── src/Plugin/Block/PortfolioCalendarBlock.php    # GitHub contribution calendar block
│       ├── src/Form/PortfolioCalendarSettingsForm.php     # 2 GitHub usernames + 2 PATs
│       ├── src/Controller/PortfolioCalendarController.php # JSON endpoint (GraphQL + fallback)
│       ├── js/portfolio_calendar.js                       # client-side grid renderer
│       └── css/portfolio_calendar.css
config/sync/                          # 237 Drupal config YAML files
scripts/
└── convert-articles.php              # MD → HTML converter for CKEditor
```

## Content Types

- **blog_post** ("Intelligence Reports"): body, excerpt, external_url, featured_image, published_date, reading_time, tags
- **project**: body, blog_reference, featured_image, project_url, tags, technologies
- Plus core `article` and `page`

## Conventions

- **PHP:** `declare(strict_types=1)`, `final` classes, typed properties, `readonly` constructor promotion, DI via `ContainerInjectionInterface` / `ConfigFormBase::create()`.
- **Secrets in `StateInterface`, not config** — GitHub PATs stored in State (not exportable). Usernames in config (exportable). This is intentional.
- **Twig:** Tailwind utility classes inline; `dark:` variants; custom `.glass`/`.glass-hover`/`.scan-line` helpers. Logic in `*.theme` preprocess; templates stay declarative.
- **JavaScript:** `theme-init.js` is an IIFE (runs before paint to avoid FOUC). `portfolio_calendar.js` uses `Drupal.behaviors` + `once()`. Vanilla JS, no runtime deps, `defer` attributes.
- **Git:** Conventional commit prefixes (`feat:`, `fix:`, `chore:`, `revert:`). Branch naming: `feature/...`, `refactor/...`, `tailwind-dev`.
- **CI:** `composer validate`, `php -l` syntax checks, `node --check` on JS, Symfony YAML parse on configs, Tailwind rebuild, `composer audit`.

## Gotchas

- **Root `tailwind.config.js` is stale** — scans `web/themes/custom/portfolio/**` (theme doesn't exist). The ACTIVE config is `web/themes/custom/portfolio_showcase/tailwind.config.js`. Root file is dead code.
- **`Readme.md` is broken** — says "run install.sh" but no `install.sh` exists. Use `README.md` (capital) instead.
- **README claims "two custom modules"** but only `portfolio_calendar` exists.
- **README version mismatch** — states Drupal 11.3.9, but `composer.json` requires `^11.3.12`.
- **`.node-version` = 16.14.0** but CI uses Node 22. Node 16 is EOL. Update this file.
- **Dual lockfiles** — both `package-lock.json` and `yarn.lock` committed. Pick one package manager.
- **`package.json` has junk deps** — `jquerry` (typo), `yarn` as dependency, duplicate `postcss-cli` versions.
- **No `settings.php` committed** (gitignored). Fresh clone needs `ddev config` to generate it.
- **DDEV `type: drupal9`** in `.ddev/config.yaml` — stale but harmless. Should be `drupal11`.
- **8 `composer audit` advisories ignored** (PKSA-* IDs in `composer.json`). Review for actual risk.
- **`core.extension.yml` is behind `composer.json`** — many contrib modules (gin, pathauto, metatag, etc.) are not in enabled extensions.
- **`portfolio_calendar` uses a third-party public fallback API** (`jogruber.de`) when no GitHub token is set — external runtime dependency.
- **Hardcoded email** `hello@andreisandu.net` in `portfolio-showcase.js` copy button — not site-config-driven.
- **No automated tests** — CI does only syntax/validation checks.
