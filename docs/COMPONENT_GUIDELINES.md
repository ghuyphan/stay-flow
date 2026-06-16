# Component Guidelines

## Reuse and naming

Use PascalCase exports and one primary component per file. Generic primitives live in `components/ui`; structural primitives in `components/layout`; domain components live in the relevant feature folder.

Props should extend native element props where useful, expose semantic variants, and avoid styling escape hatches. Use `variant`, `size`, `state`, and `asChild` consistently. New variants belong in the shared component definition.

Create a component when behavior or visual rules repeat, when accessibility requires encapsulation, or when a domain concept has stable meaning. Do not extract one-off wrappers that hide simple markup or create components only to shorten a file.

## Forms

Labels, helper text, and errors form one field group. Inputs share height, border, radius, focus, disabled, and error states. React Hook Form owns client form state; Zod schemas are shared with server validation.

## Overlays

Modals handle focused tasks and confirmation. Drawers handle mobile navigation and supplementary editing. Both trap focus, close on Escape, restore focus, label their surface, and prevent background interaction.

## Data display

Tables are for comparison across stable columns and collapse into cards or horizontal scrolling on small screens. Cards use shared border, radius, shadow, and padding. Status badges always include text. Lists own their dividers rather than children adding borders.

## Buttons

Use primary for the single main action, secondary for supporting actions, outline for neutral actions, ghost for low-emphasis controls, and destructive only for irreversible actions. Icon-only buttons require accessible labels.
