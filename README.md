## Package documentation

The public [design system specification](https://martlettheme.dev/design-system/) covers installation, typography, foundation tokens, Astro components, interaction guidance, integrations, and releases. Its [JSON reference](https://martlettheme.dev/design-system.json) is generated directly from installed npm exports.

> This website now consumes `@martlet/theme` and `@martlet/astro`. The authoritative design definitions live in [martlettheme/npm](https://github.com/martlettheme/npm). `src/palettes.mjs` re-exports the installed core; edit that upstream repository to change the design. Application adapters remain here. See [the migration playbook](https://github.com/martlettheme/astro/blob/main/docs/playbook.md).

# Martlet Theme

**Color with a story. Built for what’s next.**

Martlet Light and Martlet Dark are original color themes inspired by the blue, silver, and gold of **James P. Howard, II’s personal heraldic identity and family tartan**, documented at [jameshoward.us](https://jameshoward.us/). They do not claim to represent heraldry in general. Their first application was [Prism 7](https://prism7.app/). This project develops Martlet as a standalone, reusable theme family, not as Prism 7's stylesheet.

**Website:** [martlettheme.dev](https://martlettheme.dev/) .  
**Version:** 1.0.0.

## What is included?

- Seven documented heritage colors, two canonical light/dark palettes, and portable semantic UI tokens.
- Expanded surface, text, interaction, status, charts, and syntax colors. Unlike the original 20-role application theme, these can style an entire product.
- Generated namespaced CSS and JSON.
- Native macOS Terminal.app profiles, generic ANSI 16-color palettes, and starter VS Code color theme JSON.
- An interactive color specimen website with side-by-side Light/Dark interface, code, and terminal previews, copyable swatches, searchable tokens, and a contrast inspector.
- Contrast assertions for representative text/background pairs.

The first 20 UI roles match the original Prism 7 implementation for compatibility. **They are not frozen**: improved accessible colors can be introduced in future revisions with documented changes.

## Zsh prompt

Light and Dark `.zsh-theme` downloads are available on the website and in `ports/zsh/`. They work with plain Zsh or Oh My Zsh; see [installation and behavior](docs/ports.md#zsh-prompt-themes).

## Development

Development requires Node.js 20.19+, npm, and Zsh 5.9+ for the prompt tests.

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

## Application packages

The public distribution repositories are [martlettheme/npm](https://github.com/martlettheme/npm), [martlettheme/vim](https://github.com/martlettheme/vim), [martlettheme/emacs](https://github.com/martlettheme/emacs), [martlettheme/chrome](https://github.com/martlettheme/chrome), and [martlettheme/firefox](https://github.com/martlettheme/firefox). The editor and browser repositories include a canonical color snapshot, a dependency-free build, verification, and installation instructions. The core and Astro packages are maintained independently. Both Light and Dark are included. The website Downloads section serves the archives.

The npm packages are published as [`@martlet/theme`](https://www.npmjs.com/package/@martlet/theme) 2.0.0 and [`@martlet/astro`](https://www.npmjs.com/package/@martlet/astro) 1.0.0. Both this website and jameshoward.us install these releases from npm, with exact versions and lockfile integrity. Chrome Web Store and Mozilla Add-ons publication are also pending, and Firefox archives are unsigned. ChatGPT/Codex desktop imports under `ports/chatgpt/` use the `codex-theme-v1` format matched to a desktop app export, with Light/Dark copy buttons and `.txt` downloads. Manual Appearance settings remain available as JSON.

Run `npm run build` to generate all formats, including standalone distribution directories under `artifacts/repositories/`. See [distribution maintenance](docs/distributions.md).


## Consolidated language reference

`/design-language/` renders the pinned core grammar, source decisions and framework matrix. `scripts/sync-language.mjs --check` verifies snapshot hashes during every build. This source consolidation does not alter the installed package pins or publish the candidate packages.
