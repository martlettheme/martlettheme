# Martlet release snapshots

These archives are built from `martlettheme/npm` (`@martlet/theme` 2.0.0) and `martlettheme/astro` (`@martlet/astro` 1.0.0). They let clean builds consume the actual packages before npm registry publication. The lockfile verifies their integrity.

Do not edit files inside the archives. Change source in the package repositories, validate and pack, replace the archives, then run `npm install` to refresh integrity. Once the packages are published, switch to registry versions and remove these snapshots.

Font assets come from the pinned Fontsource dependencies, with their upstream OFL notices.
