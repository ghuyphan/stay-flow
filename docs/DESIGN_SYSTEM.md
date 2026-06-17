# StayFlow Design System

## Visual direction

StayFlow should feel like a cute, cozy booking app rather than a generic hotel website. The public experience is soft, minimal, warm, and mobile-first: calm stays, quick decisions, friendly controls, and a little personality. It should feel polished enough to trust with a booking, but approachable enough to screenshot, share, and remember.

The reference mood is "soft minimal cozy": warm cream surfaces, coral calls to action, matcha or sage support colors, ink-like text, gentle image cards, rounded app controls, simple line icons, and occasional handwritten-style accents. Personality should come from proportion, color, microcopy, chips, and imagery rather than heavy decoration.

The admin experience can keep denser information architecture, but it should still inherit the warmer token set and friendly controls. Admin screens should feel efficient and tidy, not playful.

Avoid default travel-template patterns: oversized generic hero copy, repeated shadow cards, beige/green sameness, stock-like section blocks, and long marketing sections that slow down booking.

## Tokens

Color is expressed only through semantic CSS variables. Components use background, foreground, card, primary, secondary, muted, border, input, ring, success, warning, and destructive roles. Light and dark values live in `src/app/globals.css`; homestay brand settings override the same variables.

The default public palette should follow this personality:

| Role | Direction |
| --- | --- |
| Background | Warm cream or soft off-white |
| Foreground | Deep ink, charcoal, or blue-black |
| Card | Clean white or milk-white with subtle warmth |
| Primary | Coral, peach, or strawberry for booking CTAs |
| Secondary | Matcha, sage, or soft green for supportive UI |
| Accent | Butter yellow, peach tint, or muted clay |
| Muted | Warm gray, oat, or pale cream |
| Border | Low-contrast warm gray |

Do not let the UI collapse into one hue family. A page should not read as only beige, only green, only coral, only dark blue, or only gray. Use accent color sparingly: primary CTAs, selected chips, small marks, and key highlights.

Spacing follows a 4px base: 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, and 24 units. Avoid arbitrary values.

Typography:

| Role | Size | Line height | Weight |
| --- | --- | --- | --- |
| Display | 56px | 1.05 | 600 |
| H1 | 40px | 1.1 | 600 |
| H2 | 32px | 1.2 | 600 |
| H3 | 24px | 1.25 | 600 |
| Body | 16px | 1.6 | 400 |
| Small | 14px | 1.5 | 400 |
| Label | 12px | 1.4 | 600 |

Typography should feel editorial but friendly. A refined display face may be used for the StayFlow wordmark and major headlines. Product UI, labels, inputs, prices, and dense content should use a clean rounded sans so the app feels quick and modern. Avoid dramatic serif use inside compact controls or cards.

Radius tokens are `sm`, `md`, and `lg`. Cards use `lg`; controls use `md`; badges use a full pill. Keep radii soft but controlled. Avoid making every surface a large bubble.

Shadows should be very light. Prefer borders, background contrast, and spacing over heavy elevation. Use `sm` for default cards and `md` only for floating booking/search panels. Avoid stacked shadows on repeated listing cards.

Z-index: content 0, sticky 20, dropdown 40, overlay 50, modal 60, toast 80.

## Density and layout

Public UI should be compact enough to feel app-like, especially on mobile. Cards can use 12px to 16px internal padding when paired with imagery; larger editorial sections may use 24px. Admin cards may use 16px padding. Touch targets are at least 44px. Breakpoints follow Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.

Mobile is the lead layout. The first mobile viewport should quickly show the brand, a useful hero/search action, and a hint of available stays. Avoid hero sections that consume the entire first screen without a booking path.

Desktop should feel like an expanded app, not a stretched poster. Use a strong hero/search composition, compact featured stays, and fewer full-width marketing sections.

## Public UI Patterns

Search is the primary product surface. It should feel like a friendly booking module with clear fields for place, date, guests, and stay type. Stay type choices such as Short, One day, and Overnight should use segmented controls or chips with icons.

Listing cards should feel lightweight and browsable:

- Image first, with a stable aspect ratio.
- One small tag or stay-type chip over the image.
- Optional favorite icon as a simple circular control.
- Clear title, location, rating, and price.
- Minimal metadata. Do not crowd cards with every amenity.

Trust content should be brief and practical. Lead with what Gen Z guests care about for short stays: self check-in, no staff interaction, privacy, food delivery, fast Wi-Fi, smart TV, and optional game consoles such as Nintendo Switch, PS4, or PS5. Avoid generic hotel amenities unless they directly help someone choose the room.

Handwritten-style or sticker-like accents may be used for brand moments, but only as supporting details. Do not use decorative notes as the main way to explain product functionality.

## Imagery

Images should look cozy, lived-in, bright, and inspectable. Favor real rooms, soft daylight, clean bedding, plants, warm lamps, and uncluttered corners. Avoid dark atmospheric crops, generic exterior shots, and image treatments that hide the room.

Use image overlays only when text legibility requires them. Keep overlays soft and localized. Do not cover the room with heavy black gradients.

## Performance

The visual system should be fast by default:

- Only the primary above-the-fold hero image should use `priority`.
- Listing, gallery, and below-the-fold images should lazy-load.
- Use accurate `sizes` values for mobile and desktop images.
- Prefer borders and subtle backgrounds over heavy shadows and backdrop blurs.
- Keep public pages section-light. Remove decorative sections that do not help users choose or book.
- Defer non-critical interactive surfaces, including chat widgets, until after the page has loaded or the user shows intent.

## Modes

Light mode uses a warm cream canvas and ink foreground. Dark mode uses warm charcoal or deep ink surfaces rather than pure black. Brand colors must retain readable foreground contrast; fallback foregrounds are selected by luminance.

## Accessibility

- Every interactive element has a visible focus ring.
- Text and controls target WCAG AA contrast.
- Color never carries status alone.
- Form errors are connected with `aria-describedby`.
- Motion respects `prefers-reduced-motion`.
- Images require descriptive alt text unless decorative.

## States

Empty states explain what is missing and offer one primary action. Loading states preserve the final layout shape. Errors name the failed action and provide retry or recovery. Destructive actions require confirmation.
