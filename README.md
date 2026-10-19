# Martlet Theme

**A heraldic color system for modern applications.**

Martlet Light and Martlet Dark originated in the blue, silver, and gold identity of [jameshoward.us](https://jameshoward.us/) and were first implemented as application themes in [Prism 7](https://github.com/howardjp/prism7). This independent project expands those schemes into portable design tokens, syntax colors, terminal palettes, data visualization colors, and reusable implementation assets.

> Work in progress. The source palette and the existing Prism 7 semantic variables are preserved exactly. Extended colors and ports are provisional until tested.

The canonical theme definitions live in `src/`. A zero-dependency build script generates distribution formats and the Astro documentation website lives in `site/`.

## Development

```bash
npm run tokens
npm test
npm install
npm run dev
npm run build
```

## Provenance

The original heraldic/tartan colors are documented at [A New Tartan](https://jameshoward.us/2025/05/26/a-new-tartan/). Prism 7 adaptations are derived from its `src/core/appearance.js` file on `work/first-platform`. No trademark or license grant for independently sourced heraldic artwork is implied by the software license.

## Status

Design and development preview. Not yet a public theme release.
