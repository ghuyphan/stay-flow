# StayFlow Design System

## Visual direction

StayFlow feels calm, capable, and hospitality-led. The public experience pairs warm editorial imagery with crisp booking controls. The admin experience uses the same tokens with denser information architecture. Interfaces should feel premium without becoming ornamental.

## Tokens

Color is expressed only through semantic CSS variables. Components use background, foreground, card, primary, secondary, muted, border, input, ring, success, warning, and destructive roles. Light and dark values live in `src/app/globals.css`; homestay brand settings override the same variables.

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

Radius tokens are `sm`, `md`, and `lg`. Cards use `lg`; controls use `md`; badges use a full pill. Shadows are `sm` for default elevation and `md` for floating surfaces.

Z-index: content 0, sticky 20, dropdown 40, overlay 50, modal 60, toast 80.

## Density and layout

Public cards use comfortable density and at least 24px padding. Admin cards may use 16px padding. Touch targets are at least 44px. Breakpoints follow Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.

## Modes

Light mode uses a warm white canvas and ink foreground. Dark mode uses deep blue-gray surfaces rather than pure black. Brand colors must retain readable foreground contrast; fallback foregrounds are selected by luminance.

## Accessibility

- Every interactive element has a visible focus ring.
- Text and controls target WCAG AA contrast.
- Color never carries status alone.
- Form errors are connected with `aria-describedby`.
- Motion respects `prefers-reduced-motion`.
- Images require descriptive alt text unless decorative.

## States

Empty states explain what is missing and offer one primary action. Loading states preserve the final layout shape. Errors name the failed action and provide retry or recovery. Destructive actions require confirmation.
