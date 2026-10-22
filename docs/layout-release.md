# Layout integration

This branch consumes published registry packages `@martlet/theme@2.1.0` and `@martlet/astro@1.1.0`. The temporary candidate archives have been removed. The gallery, standalone article/landing/documentation pages, and design-system reference use the actual installed packages.

Package releases:

- https://github.com/martlettheme/npm/releases/tag/v2.1.0
- https://github.com/martlettheme/astro/releases/tag/v1.1.0

Before merging, require a clean `npm ci`, all package and browser checks, and a successful Cloudflare build/deployment check. The originating production site remains on its existing published dependencies until demonstration-site validation is complete.

Future stable GitHub releases publish through npm trusted publishing after verification. The package repositories document the publisher settings and release order in `docs/releasing.md`.
