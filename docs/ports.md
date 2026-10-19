# Starter ports

The generator currently emits two VS Code theme JSON files and two terminal 16-color JSON descriptors.

These are **color sources**, not a ready-to-install VS Code extension or an emulator-specific terminal configuration. A proper extension needs its own package manifest, icon, versioning, accessibility verification, Marketplace artwork and release pipeline. Terminals have inconsistent naming conventions and multiple emulator-specific formats; each should be implemented and tested individually.

Future targets: VS Code extension, Kitty, iTerm2, Windows Terminal, Alacritty, Vim/Neovim, Obsidian, and CSS framework presets.

The first wave of ports should favor accuracy and testing over sheer count.
