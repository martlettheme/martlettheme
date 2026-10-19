# Martlet Theme

**Color with a story. Built for what’s next.**

Martlet Light and Martlet Dark are original color themes inspired by the blue, silver, and gold of **James P. Howard, II’s personal heraldic identity and family tartan**, documented at [jameshoward.us](https://jameshoward.us/). They do not claim to represent heraldry in general. Their first application was [Prism 7](https://prism7.app/). This project develops Martlet as a standalone, reusable theme family, not as Prism 7's stylesheet.

**Website:** [martlettheme.dev](https://martlettheme.dev/) (planned, not yet deployed).  
**Status:** development preview, not a published or audited theme release.

## What is included?

- Seven documented heritage colors, two canonical light/dark palettes, and portable semantic UI tokens.
- Expanded surface, text, interaction, status, charts, and syntax colors. Unlike the original 20-role application theme, these can style an entire product.
- Generated namespaced CSS and JSON.
- Native macOS Terminal.app profiles, generic ANSI 16-color palettes, and starter VS Code color theme JSON.
- An interactive color specimen website with side-by-side Light/Dark interface, code, and terminal previews, copyable swatches, searchable tokens, and a contrast inspector.
- Contrast assertions for representative text/background pairs.

The first 20 UI roles match the original Prism 7 implementation for compatibility. **They are not frozen**: improved accessible colors can be introduced in future revisions with documented changes.

## Development

Requires Node.js 20.19+ and npm.

```sh
npm install
npm run tokens
npm test
npm run dev
npm run build
```

The site uses the owner's shared Google Analytics measurement ID `G-FSDET4HG4L`. The tag is blocked until visitors accept optional analytics. `PUBLIC_GA_ID` can override that default; an explicitly blank value disables it. Cookie Settings in the footer supports withdrawal, and Global Privacy Control keeps analytics off. See [the website privacy implementation](docs/privacy.md).

For browser verification, run `npx playwright install chromium`, then `npm run build && npm run test:browser`. These checks intercept the Google tag and never submit real Analytics data.

Generated deliverables are placed in `artifacts/` and `site/public/downloads/`. Those directories are derived from `src/palettes.mjs` and should not be edited manually.

## Use on a website

```html
<link rel="stylesheet" href="/downloads/martlet.css">
<html data-martlet="dark">
```

Then `background: var(--martlet-bg)` and `color: var(--martlet-text)`. The theme attribute belongs on the element that scopes the appearance. Light and dark may also coexist on isolated subtrees.

## Roadmap

See [docs/architecture.md](docs/architecture.md) for the token schema and project structure. Native Terminal.app profiles and import instructions are in [docs/ports.md](docs/ports.md). Their plist structure and colors are validated; macOS import/rendering verification is pending. VS Code and generic terminal JSON remain starter color definitions. Further integration targets will be added after their application-specific behavior and contrast are reviewed.

## Provenance and licensing

Original source colors from the [James Howard & Family tartan](https://jameshoward.us/2025/05/26/a-new-tartan/); application role choices adapted from Prism 7's `src/core/appearance.js` on `work/first-platform`. The code and token definitions in this repository are MIT licensed. The license does not claim to grant independent rights to any heraldic badge, arms, or third-party artwork.
