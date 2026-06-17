# Theme Customization

Theme configuration is validated JSON mapped to semantic CSS variables. `getThemeConfig()` resolves stored configuration with defaults. `validateThemeConfig()` rejects unsupported fonts, radius presets, modes, and invalid colors. `applyThemeVariables()` returns a safe style map for trusted React roots.

Mode can be light, dark, or system. System mode follows `prefers-color-scheme`; previews can force either appearance without changing the saved preference.

Owners may customize primary, accent, background, foreground, radius preset, approved font, button preset, card preset, and mode. Focus visibility, minimum contrast, spacing scale, typography hierarchy, component anatomy, status colors, and container widths are locked.

Public themes should preserve the StayFlow personality even when customized. Prefer warm cream backgrounds, ink foregrounds, coral or peach CTAs, and sage/matcha secondary colors. Host themes may shift the palette, but they should still feel soft, cozy, minimal, and booking-app-like rather than corporate, luxury-hotel, or generic travel-template.

Theme previews should include mobile search, stay cards, chips, and primary CTAs. A theme is not ready if those surfaces lose contrast, feel visually heavy, or read as a single-color palette.

Draft theme changes render only in the admin preview. Publishing stores validated configuration and triggers public route revalidation.
