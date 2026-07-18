---
name: jellysafe-design-system
description: >-
  JellySafe design system — reusable Tailwind CSS v4 design tokens (colors,
  spacing, typography, icon sizes), semantic-token conventions, and React UI
  component APIs (Button, Badge, Card, Chip, Dropdown, TextField, BottomSheet,
  Tabs, Toast, MapPin, LoadingSpinner, and more). Use when building or
  restyling UI to match the JellySafe look, bootstrapping these tokens in a new
  project, keeping Public/Admin visually consistent, or looking up a
  component's props, tokens, or usage. Mobile-first, Pretendard font, 4-level
  risk color scale (safe/caution/danger/critical).
---

# JellySafe Design System

A single design system shared by JellySafe's Public (mobile web) and Admin
(desktop) apps. Built on **React 19 + Tailwind CSS v4** using **CSS custom
properties** (`@theme`) for tokens. Visual source of truth is Figma.

Use this skill to reproduce the tokens/components in another project, or to
build new UI that matches the system exactly.

## Core principles

1. **Tokens first, never raw values.** Never write raw hex, px font sizes, or
   ad-hoc spacing in components. Always reference semantic tokens
   (`bg-bg-default`, `text-text-primary`) and spacing/type scales
   (`px-(--padding-5)`, `text-body-large-mobile`).
2. **Primitive → Semantic → Component.** Primitives are raw palette/scale
   values; semantics map them to roles (`--color-text-primary`); components
   consume semantics. Add radius/shadow only when the design defines them.
3. **Reuse before creating.** Check the component list below before making a
   new component. Extend via `className`, don't fork.
4. **Mobile-first, contained width.** Public UI is a mobile web app capped at
   `max-w-[430px]`, centered on wide screens. See patterns.md.
5. **Accessible by default.** Icon-only buttons need accessible names;
   interactive elements support `focus-visible` outlines; honor
   `prefers-reduced-motion`.
6. **Server-data screens handle 4 states:** loading, empty, error, success.

## Tailwind v4 token syntax (important)

This system uses Tailwind v4's arbitrary-property + CSS-var shorthand. Read
these before writing markup:

- Spacing: `px-(--padding-5)`, `gap-(--gap-3)`, `py-(--padding-4)` — the
  `(--token)` form resolves the CSS variable. (Not `p-4`.)
- Icon size: `size-(--icon-size-24)`.
- Typography: `text-body-large-mobile`, `text-heading-small-mobile` — generated
  from `@theme --text-*` tokens (includes weight/line-height/letter-spacing).
- Color utilities from semantic tokens: `bg-bg-default`, `text-text-primary`,
  `border-border-default`, `text-icon-brand`, `text-text-inverse`.
- One-off values only when unavoidable:
  `bg-[color-mix(in_srgb,var(--color-safe-50)_25%,white)]`.

## Component index

| Component | Purpose | Key props |
|---|---|---|
| `Button` | Primary/secondary/tertiary actions | `platform`, `variant`, `size`, `isSelected` |
| `Badge` | Risk/status chip | `status` (safe/caution/danger/critical), `platform` |
| `Card` | Surface / outlined container | `variant` (surface/outlined) |
| `Chip` | Toggle filter | `selected`, `onSelectedChange` |
| `Dropdown` | Single-select listbox | `options`, `value`, `onValueChange` |
| `Combobox` | Trigger that opens a custom sheet/menu | `label`, `value`, `action` |
| `TextField` | Labeled text input | `label`, `state`, `error`, `onClear` |
| `BottomSheet` | Modal sheet (drag-to-close) | `open`, `onClose`, `title`, `footer` |
| `Tabs` | Segmented / underline tabs | `items`, `value`, `variant` |
| `Header` | App bar | `title`, `leadingIcon`, `trailingAction` |
| `List` / `ListItem` | Rows with leading/trailing | `divider`; `title`, `leading`, `trailing`, `href` |
| `Toast` | Top status message | children |
| `Tooltip` | Hover/focus popover | `content`, `side` |
| `WheelPicker` | iOS-style wheel columns | `columns`, `onChange` |
| `Image` | Image with load/error states | `src`, `alt` |
| `Skeleton` | Loading placeholder | `className` (size) |
| `LoadingSpinner` | Spinner | `size`, `label` |
| `Logo` | Brand mark / logotype | `variant` (symbol/logotype) |
| `MapPin` | Map marker (risk-colored) | `status`, `state`, `label` |
| `useScrollIndicator` | Hook: show scrollbar only while scrolling | — |

Full signatures + snippets: [references/components.md](references/components.md).

## Reference map

- [references/setup.md](references/setup.md) — install as a project, Tailwind v4
  wiring, font hosting, and how to install this folder as a Claude skill.
- [references/tokens.md](references/tokens.md) — full primitive + semantic
  color/spacing/icon tokens, the 4-level risk scale, and paste-ready CSS.
- [references/typography.md](references/typography.md) — type scale and
  `@theme` typography CSS (Pretendard).
- [references/components.md](references/components.md) — every component's props
  and usage.
- [references/patterns.md](references/patterns.md) — mobile app shell, data
  states, accessibility, motion, and naming conventions.

## When reproducing in a new project

1. Copy the token + typography CSS (tokens.md, typography.md) into your styles
   and `@import` them after `@import "tailwindcss";`.
2. Self-host Pretendard Variable (typography.md).
3. Add components from components.md as you need them — they are plain
   React + Tailwind, no runtime dependency beyond `react`/`react-dom`.
4. Follow patterns.md for shell layout and state handling.
