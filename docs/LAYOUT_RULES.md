# Layout Rules

Public content uses the shared `Container` with a 1280px maximum width. Reading content may use a narrower 768px measure. Page gutters are 16px mobile, 24px tablet, and 32px desktop.

Use a 12-column desktop grid, 6-column tablet grid, and 4-column mobile grid. Sections use 48px to 64px vertical spacing on mobile and 72px to 96px on desktop. Align section headings, content, and actions to the same container edge.

The public site is mobile-first. The first mobile viewport should include the StayFlow brand, an immediate booking/search path, and a visible hint of stay inventory. Avoid full-screen hero layouts that delay browsing or booking.

Desktop layouts should expand the mobile app experience rather than become a generic landing page. Use one strong hero/search composition, then move quickly into featured stays or rooms.

Responsive layouts stack content in reading order. Do not reorder essential actions visually without matching DOM order. Booking summaries may become sticky only when the full panel fits in the viewport.

Search and booking panels can overlap imagery slightly when it improves hierarchy, but sections may not rely on negative margins that create fragile overlap across builder previews. Check 390px, 768px, and 1440px preview widths.

On mobile, sticky or bottom booking actions are allowed when they do not cover form fields, prices, or required legal/payment text. Leave enough bottom spacing for fixed actions.

The public shell owns navigation, footer, and page background. The dashboard shell owns sidebar, top bar, and content gutter. Admin pages use a consistent header row followed by filters/actions and then content.

Public navigation should be visually light: brand, primary browsing path, language/theme controls, and menu. Avoid heavy nav bars, large shadows, and persistent decorative elements in the shell.

Builder sections are trusted blocks constrained to the public container. Drag handles do not change section internals. Preview widths are 1440px desktop, 768px tablet, and 390px mobile. Sections cannot overlap or use negative positioning.

Public homepage section order should stay short and booking-led: hero/search, featured stays, compact trust, and support/FAQ. Add gallery or amenity sections only when they show content that helps a guest choose.

Prevent misalignment by using `Container`, `Stack`, `Inline`, and `Grid`; do not reproduce page gutters inside feature components.
