# Layout Rules

Public content uses the shared `Container` with a 1280px maximum width. Reading content may use a narrower 768px measure. Page gutters are 16px mobile, 24px tablet, and 32px desktop.

Use a 12-column desktop grid, 6-column tablet grid, and 4-column mobile grid. Sections use 64px vertical spacing on mobile and 96px on desktop. Align section headings, content, and actions to the same container edge.

Responsive layouts stack content in reading order. Do not reorder essential actions visually without matching DOM order. Booking summaries may become sticky only when the full panel fits in the viewport.

The public shell owns navigation, footer, and page background. The dashboard shell owns sidebar, top bar, and content gutter. Admin pages use a consistent header row followed by filters/actions and then content.

Builder sections are trusted blocks constrained to the public container. Drag handles do not change section internals. Preview widths are 1440px desktop, 768px tablet, and 390px mobile. Sections cannot overlap or use negative positioning.

Prevent misalignment by using `Container`, `Stack`, `Inline`, and `Grid`; do not reproduce page gutters inside feature components.
