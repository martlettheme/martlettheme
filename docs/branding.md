# Martlet artwork

`site/public/martlet-mark.svg` is the master mark: the martlet from James P. Howard, II’s supplied `martlet.svg`, with its vector paths retained and recolored on a `#154C9E` blue background.

- Main gold: `#FEE46E`
- Dark gold / outlines: `#AC8800`
- Light gold: `#FFF1A1`
- Eye highlight: `#FFFFFF`

The header, hero, and illustrative application use the same master SVG. `favicon.svg` is an identical copy for browser discovery. The ICO fallback contains 16, 32, and 48 pixel images; the Apple touch icon is 180 pixels; the web manifest uses 192 and 512 pixel PNGs. All raster icons derive from the master SVG.

When changing the master artwork, update the favicon copy and regenerate the raster icons with an SVG renderer. Retain the blue square, aspect ratio, and clear space around the bird; avoid using the bird as a font glyph.

As stated in the repository README, the software license does not independently grant rights to heraldic artwork. This file documents the supplied artwork and its adaptation, without assigning a new license to it.
