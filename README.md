# Martlet Theme

**A heraldic color system for modern applications.**

Martlet Light and Martlet Dark draw on the blue, silver and gold heraldic identity associated with [jameshoward.us](https://jameshoward.us/). Their first application was [Prism 7](https://prism7.app/). This project develops Martlet as a standalone, reusable theme family, not as Prism 7's stylesheet.

**Website:** [martlettheme.dev](https://martlettheme.dev/) (planned, not yet deployed).  
**Status:** development preview, not a published or audited theme release.

## What is included?

- Seven documented heritage colors, two canonical light/dark palettes, and portable semantic UI tokens.
- Expanded surface, text, interaction, status, charts, and syntax colors. Unlike the original 20-role application theme, these can style an entire product.
- Generated namespaced CSS and JSON.
- Starter ANSI 16-color terminal palettes and VS Code color theme JSON.
- An interactive Astro documentation website, produced from the same canonical palette definitions.
- Contrast assertions for representative text/background pairs.

The first 20 UI roles match the original Prism 7 implementation for compatibility. **They are not frozen**: improved accessible colors can be introduced in future revisions with documented changes.

## Development

Requires Node.js 20.3+ and npm.

```sh
npm install
npm run tokens
npm test
npm run dev
npm run build
```

Generated deliverables are placed in `artifacts/` and `site/public/downloads/`. Those directories are derived from `src/palettes.mjs` and should not be edited manually.

## Use on a website

```html
<link rel="stylesheet" href="/downloads/martlet.css">
<html data-martlet="dark">
```

Then `background: var(--martlet-bg)` and `color: var(--martlet-text)`. The theme attribute belongs on the element that scopes the appearance. Light and dark may also coexist on isolated subtrees.

## Roadmap

See [docs/architecture.md](docs/architecture.md) for the token schema and project structure. Terminal and VS Code outputs are **starter ports**, not yet distributable editor extensions. Further integration targets will be added after their application-specific behavior and contrast are reviewed.

## Provenance and licensing

Original source colors from the [James Howard & Family tartan](https://jameshoward.us/2025/05/26/a-new-tartan/); application role choices adapted from Prism 7's `src/core/appearance.js` on `work/first-platform`. The code and token definitions in this repository are MIT licensed. The license does not claim to grant independent rights to any heraldic badge, arms, or third-party artwork.
