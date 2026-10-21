# Martlet architecture

The public [design system specification](https://martlettheme.dev/design-system/)
and [JSON reference](https://martlettheme.dev/design-system.json) are generated
from the installed core and Astro releases. Canonical definitions live in
`martlettheme/npm`; `src/palettes.mjs` re-exports that installed package.
Site layout and application port generators remain in this repository.

Martlet's heritage palette is distinct from its application palette.

- **Heritage**: canonical historical/livery hues (blue, silver, gold). Their meaning and attribution should not be casually redefined.
- **Semantic tokens**: colors by purpose, with matched names between modes. The source is the published core; `src/palettes.mjs` re-exports it.
- **Ports**: program-specific transformations of the semantic source: `src/ports.mjs`.
- **Distribution**: CSS, JSON, and native Terminal.app profiles emitted by `npm run tokens`, and a reference website built with Astro.

Never write generated files by hand. If a new role is added in one mode, add it in both modes and document its intended use. Use namespaced CSS names `--martlet-*` to avoid collisions with host applications.

## Compatibility

The original Prism 7 variables are preserved in v1.0 as recognizable tokens. Future changes to these values are allowed when justified by accessibility, consistency, or design quality; they must be noted in the changelog and tested. Do not export Prism 7's selectors (`body[data-theme]` or `.publication-page`), as Martlet must not assume any host's DOM structure.

## Contrast and use

The tests enforce the WCAG 2.x 4.5:1 text ratio for a **defined list of foreground/background pairs only**. This is not a blanket claim that all palette combinations, state indicators, code tokens, charts, or application ports meet WCAG. Evaluate focus rings, non-text contrast (3:1 where applicable), color-vision deficiencies, and actual rendered applications separately.

Syntax and chart colors are not interchangeable with user-interface button accents. Different token roles exist because their combinations, density and meaning differ.

## Published website

`martlettheme.dev` consumes the same published packages as jameshoward.us.
