# Patterns & conventions

## Mobile app shell (Public)

The Public app is a mobile web app centered in a fixed-width column and never
scrolls the document — only an inner container scrolls (avoids iOS Safari
nested-scroll jank).

- Width cap: `mx-auto w-full max-w-[430px]` (wide screens show it centered on a
  surface background). Don't stretch mobile elements to full desktop width.
- Shell: `fixed inset-0 flex flex-col overflow-hidden bg-bg-default` + the
  max-width class. One child is `flex-1 min-h-0 overflow-y-auto
  overscroll-y-contain` — the single scroll region.
- Fixed bottom UI (nav / CTA) is a `fixed bottom-0 left-1/2 -translate-x-1/2
  w-full max-w-[430px]` wrapper; add bottom clearance so content isn't hidden.
- Safe areas: pad bottom with `pb-[max(var(--padding-8),env(safe-area-inset-bottom))]`
  and set `viewport-fit=cover` (setup.md).

Sketch:

```tsx
<div className="fixed inset-0 mx-auto flex w-full max-w-[430px] flex-col overflow-hidden bg-bg-default">
  <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain scrollbar-none px-(--padding-5) pt-(--padding-8)">
    {children}
  </div>
  <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2">{footer}</div>
</div>
```

Sub-pages (no bottom nav) use a back-button header row:
`flex items-center gap-(--gap-3) bg-bg-default px-(--padding-5) py-(--padding-4)`
with an `aria-label="뒤로 가기"` chevron-left button + `h1
text-heading-small-mobile`.

Admin is desktop-first (min-width + internal scroll for tables); keep column
density, don't turn tables into cards.

## Bottom navigation

Fixed 3–5 tab bar. Each item: icon (24, `currentColor`) + caption label; active
tab `text-text-brand`, inactive `text-text-tertiary`; `aria-current="page"` on
active. Bar: `bg-bg-default pt-(--padding-3)
pb-[max(var(--padding-8),env(safe-area-inset-bottom))]
drop-shadow-[0_0_4px_var(--color-alpha-black-5)]`.

## Data-state handling (required)

Every server-data screen renders four states — loading, error, empty, success:

```tsx
{isLoading ? <Skeleton className="h-[120px] w-full rounded-2xl" />
 : isError ? <p className="py-(--padding-10) text-center text-body-xsmall-mobile text-text-tertiary">불러오지 못했습니다</p>
 : items.length ? <List>…</List>
 : <p className="py-(--padding-10) text-center text-body-xsmall-mobile text-text-tertiary">결과가 없습니다</p>}
```

Empty/error copy is short, centered, `text-text-tertiary`. Prefer `Skeleton`
blocks matching final layout over a bare spinner for content areas.

## Risk color usage

- Use the 4-level scale (safe/caution/danger/critical) consistently; always pair
  color with a text label (accessibility — never color alone).
- `Badge` for compact status; a tinted banner (`color-mix … 25%`, matching
  border 50%) for guidance blocks.
- Map backend `severe` → `critical` at the mapper layer, not in the view.

## Accessibility

- Icon-only buttons: `aria-label`. Toggles: `aria-pressed` (chip/segmented) or
  `role="switch"` + `aria-checked`.
- Focus ring on all interactive elements:
  `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-brand)]`.
- Inputs: `<label htmlFor>`; errors via `aria-invalid` + `aria-describedby`.
- Live regions: `role="status"` for toasts/loading text.
- Respect `prefers-reduced-motion` (utilities already gate animations; use
  `motion-reduce:animate-none` on custom ones).

## Motion — `motion.css`

Custom keyframes + `@utility` classes (Tailwind v4). All gated under
`@media (prefers-reduced-motion: reduce)`.

- `animate-skeleton-pulse` — gray-10 ↔ gray-20, ~1.9s (used by `Skeleton`).
- `animate-map-pin-bob` — 5px bob for `MapPin` focused-raised.
- `animate-panel-slide-up` — 0.35s ease-out translateY(100%→0) for detail panels.
- `animate-toast-slide-in` / `animate-toast-slide-out` — top toast enter/exit
  (spring-ish cubic-bezier).

Define with `@keyframes name {…}` then `@utility animate-name { animation: name … }`,
and add a reduced-motion override that disables/normalizes each.

## Hydration-safe client state

Read browser-only values (cookies, localStorage, permission support) via
`useSyncExternalStore` with a stable server snapshot — not `useEffect` +
`setState` (avoids hydration mismatch and lint `set-state-in-effect`). Keep an
in-memory module mirror so snapshots are referentially stable.

```tsx
const value = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
```

## Naming conventions

- Files/segments: `kebab-case`; components/types: `PascalCase`; hooks:
  `useSomething.ts`; utils/services: `kebab-case.ts`.
- Booleans `is/has/can/should`; callback props `onSomething`; internal handlers
  `handleSomething`; global constants `UPPER_SNAKE_CASE`; CSS vars `kebab-case`.
- Prefer string unions over enums. No `any`, no unsafe assertions. Server
  Components by default; add `"use client"` only when needed.

## Do / Don't

Do:
- Reference semantic tokens and the spacing/type scales for everything.
- Reuse a component before making a new one; extend via `className`.
- Keep the design system free of routes, API calls, auth, app state, domain copy.

Don't:
- Write raw hex, px font sizes, or ad-hoc spacing in components.
- Add radius/shadow "tokens" the style guide doesn't define — use Tailwind
  radius utils + one-off shadows with alpha tokens.
- Install a UI/icon library — icons are inline `currentColor` SVGs (viewBox
  `0 0 24 24`, preserve the viewBox).
- Use color as the only signal for risk/status.
