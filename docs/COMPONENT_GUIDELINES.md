# Component Guidelines

## Reuse and naming

Use PascalCase exports and one primary component per file. Generic primitives live in `components/ui`; structural primitives in `components/layout`; domain components live in the relevant feature folder.

Props should extend native element props where useful, expose semantic variants, and avoid styling escape hatches. Use `variant`, `size`, `state`, and `asChild` consistently. New variants belong in the shared component definition.

Create a component when behavior or visual rules repeat, when accessibility requires encapsulation, or when a domain concept has stable meaning. Do not extract one-off wrappers that hide simple markup or create components only to shorten a file.

## Forms

Labels, helper text, and errors form one field group. Inputs share height, border, radius, focus, disabled, and error states. React Hook Form owns client form state; Zod schemas are shared with server validation.

Public booking forms should feel like compact app controls. Prefer grouped field modules, segmented controls, and icon-supported labels over long stacked forms. On mobile, the primary booking/search action should be full-width and visually obvious.

Search fields should prioritize the booking decision: place, date, guests, and stay type. Do not add secondary filters to the first search module unless they materially improve conversion.

## Overlays

Modals handle focused tasks and confirmation. Drawers handle mobile navigation and supplementary editing. Both trap focus, close on Escape, restore focus, label their surface, and prevent background interaction.

## Data display

Tables are for comparison across stable columns and collapse into cards or horizontal scrolling on small screens. Cards use shared border, radius, shadow, and padding. Status badges always include text. Lists own their dividers rather than children adding borders.

Public stay cards are image-led product cards, not marketing cards. Keep them lightweight: stable image ratio, one visible tag, title, location, rating, and price. Use hearts, small chips, and simple line icons for recognizable actions. Avoid stuffing cards with long descriptions, repeated amenities, or multiple competing badges.

Chips and badges should feel friendly and useful. Use them for stay type, mood, selected filters, and compact amenity labels. Copy should be short: examples include `Short`, `One day`, `Overnight`, `Cozy`, `Photo cute`, and `Quiet`.

## Buttons

Use primary for the single main action, secondary for supporting actions, outline for neutral actions, ghost for low-emphasis controls, and destructive only for irreversible actions. Icon-only buttons require accessible labels.

Primary public CTAs use the warm coral/peach primary token and direct booking language such as `Find stays`, `Book now`, or `Check rooms`. Avoid generic labels when a more specific booking action is available.

Icon-only controls are preferred for familiar repeated actions such as favorite, menu, close, back, next, share, and filters. Pair unfamiliar icons with visible text or an accessible tooltip.

## Decorative Details

Decorative handwritten notes, sticker labels, color swatches, or tape-like effects are allowed only as brand accents. They should never replace accessible labels, instructions, or core navigation.

Keep decorative details sparse. One memorable accent per viewport is usually enough.
