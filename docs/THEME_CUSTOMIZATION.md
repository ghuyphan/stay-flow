# Theme Customization

Theme configuration is validated JSON mapped to semantic CSS variables. `getThemeConfig()` resolves stored configuration with defaults. `validateThemeConfig()` rejects unsupported fonts, radius presets, modes, and invalid colors. `applyThemeVariables()` returns a safe style map for trusted React roots.

Mode can be light, dark, or system. System mode follows `prefers-color-scheme`; previews can force either appearance without changing the saved preference.

Owners may customize primary, accent, background, foreground, radius preset, approved font, button preset, card preset, and mode. Focus visibility, minimum contrast, spacing scale, typography hierarchy, component anatomy, status colors, and container widths are locked.

Draft theme changes render only in the admin preview. Publishing stores validated configuration and triggers public route revalidation.
