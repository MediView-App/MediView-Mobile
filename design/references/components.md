# Components

All components are React + Tailwind v4, no extra runtime deps. Interactive ones
start with `"use client"`. They accept `className` for extension and use
semantic tokens only. Core visual components include full source (copy-paste);
complex interactive ones give signature + behavior to rebuild.

Conventions used throughout:
- `platform?: "pc" | "mobile"` switches type scale / sizing.
- Icon-only buttons carry `aria-label`; toggles use `aria-pressed` /
  `role="switch"`; focus rings use
  `focus-visible:outline-2 focus-visible:outline-offset-2 outline-[var(--color-border-brand)]`.

---

## Badge — full source

Risk/status pill. Background = status 25% over white; text = status `-50`.

```tsx
import type { HTMLAttributes } from "react";
export type BadgeStatus = "critical" | "danger" | "caution" | "safe";
export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: BadgeStatus;
  platform?: "pc" | "mobile";
};
const STATUS_CLASSES: Record<BadgeStatus, string> = {
  critical: "bg-[color-mix(in_srgb,var(--color-critical-50)_25%,white)] text-[var(--color-critical-50)]",
  danger:   "bg-[color-mix(in_srgb,var(--color-danger-50)_25%,white)] text-[var(--color-danger-50)]",
  caution:  "bg-[color-mix(in_srgb,var(--color-caution-30)_25%,white)] text-[var(--color-caution-50)]",
  safe:     "bg-[color-mix(in_srgb,var(--color-safe-50)_25%,white)] text-[var(--color-safe-50)]",
};
export function Badge({ status, platform = "pc", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={["inline-flex items-center justify-center rounded-sm px-(--padding-2) py-(--padding-1) whitespace-nowrap",
        platform === "mobile" ? "text-caption-medium-mobile" : "text-caption-medium-pc",
        STATUS_CLASSES[status], className].filter(Boolean).join(" ")}
      {...props}>{children}</span>
  );
}
```

## Card — full source

```tsx
import type { HTMLAttributes, Ref } from "react";
export type CardVariant = "surface" | "outlined";
export type CardProps = HTMLAttributes<HTMLDivElement> & { variant?: CardVariant; ref?: Ref<HTMLDivElement> };
const VARIANT_CLASSES: Record<CardVariant, string> = {
  surface: "bg-bg-surface",
  outlined: "border border-border-default bg-bg-default",
};
export function Card({ variant = "surface", className, ...props }: CardProps) {
  return <div className={["rounded-2xl", VARIANT_CLASSES[variant], className].filter(Boolean).join(" ")} {...props} />;
}
```

## Chip — full source

Toggle filter. Selected = brand border + brand text.

```tsx
"use client";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
export type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode; selected?: boolean; onSelectedChange?: (selected: boolean) => void;
};
export function Chip({ children, selected = false, onSelectedChange, disabled, className, onClick, ...props }: ChipProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => { onClick?.(e); onSelectedChange?.(!selected); };
  return (
    <button aria-pressed={selected}
      className={["inline-flex h-[30px] items-center justify-center rounded-lg border bg-bg-default px-(--padding-3) py-(--padding-2) text-caption-small-pc whitespace-nowrap",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-brand)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "border-border-brand text-text-brand" : "border-border-default text-text-tertiary",
        className].filter(Boolean).join(" ")}
      disabled={disabled} onClick={handleClick} type="button" {...props}>{children}</button>
  );
}
```

## Button

Radius `rounded-lg` (8px). PC: primary/secondary, small/medium. Mobile adds
`tertiary` (with `isSelected`). Discriminated union enforces valid combos.

```tsx
// platform="pc": variant primary|secondary, size small|medium
// platform="mobile": variant primary | secondary(medium) | tertiary(medium, isSelected?)
<Button variant="primary">저장</Button>
<Button platform="mobile" variant="secondary">취소</Button>
<Button platform="mobile" variant="tertiary" isSelected={active} onClick={...}>주의</Button>
```

Variant classes (enabled hover/active):
- primary: `bg-button-primary-fill text-text-inverse` → hover `-fill-hover`, active `-fill-pressed`.
- secondary: `bg-button-secondary-fill text-text-brand` → hover/active variants.
- tertiary: `border border-button-tertiary-border bg-button-tertiary-fill text-text-tertiary`;
  selected → `border-border-brand bg-button-tertiary-fill-selected text-text-brand`.
- disabled: `disabled:bg-button-disabled-fill disabled:text-text-disabled`.
- Padding: small `py-(--padding-3)` + caption text; medium `py-(--padding-4)` + body-small; `px-(--padding-5)`.

## TextField

Labeled input with optional clear button + error state.

```tsx
// props: platform, label (required), state "default"|"completed"|"error", error?, onClear?
<TextField label="이메일" state={hasError ? "error" : "default"} error="형식이 올바르지 않습니다"
  value={v} onChange={...} onClear={() => setV("")} />
```
Behavior: wrapper `rounded-lg border` toggles `border-border-error` /
`focus-within:border-border-brand`; error text uses `text-text-error` and is
wired via `aria-describedby` + `aria-invalid`. Max width mobile 328 / pc 426.

## Dropdown

Accessible single-select listbox (button trigger + `role="listbox"`).

```tsx
type DropdownOption = { value: string; label: ReactNode; disabled?: boolean };
<Dropdown aria-label="정렬" options={opts} value={sort}
  onValueChange={setSort} menuClassName="right-0" />
```
Full keyboard support (Arrow/Home/End/Enter/Esc), outside-click close, selected
highlighted. Trigger shows chevron up/down. Menu `min-w-[160px]`, `rounded-lg`
bordered surface.

## Combobox

Trigger styled like a select but opens **your own** sheet/menu (e.g. BottomSheet
or WheelPicker). Props: `label?`, `value?`, `placeholder?`, `action?:
{ label, onClick }`. Use when the picker UI is custom.

## BottomSheet

Native `<dialog>` floating card, drag-down-to-close (≥80px). Left/right inset 8,
bottom 32, `rounded-2xl`, backdrop `bg-bg-dim`, `max-h-[80dvh]`, internal scroll.

```tsx
<BottomSheet open={open} onClose={close} title="정렬" caption="기준을 선택하세요" footer={<Button.../>}>
  {children}
</BottomSheet>
```
Handle bar at top; `title` wires `aria-labelledby`, else pass `aria-label`.

## Tabs

Two variants: `segmented` (pill group on `bg-bg-surface`) and `line`
(underline). Roving-tabindex keyboard nav. `hasNew` shows a dot.

```tsx
type TabItem = { value: string; label: ReactNode; hasNew?: boolean; controls?: string };
<Tabs aria-label="알림 탭" items={items} value={tab} onValueChange={setTab} variant="line" />
```

## Header

App bar row: `leadingIcon` + `title` (h1) + optional `badge` + `trailingAction`.
`platform` switches padding/type. Title truncates.

```tsx
<Header platform="mobile" title="해변 상세" leadingIcon={<Back/>} trailingAction={<Like/>} />
```

## List / ListItem

```tsx
<List divider>
  <ListItem title="관심 해변" trailing={<ChevronRight/>} href="/favorites" />
  <ListItem title="알림" leading={<Bell/>} description="위험도 상승 시" align="start" />
</List>
```
`ListItem` renders an `<a>` when `href` is set. `align` "start" | "center".

## Toast — full source

Top-center status message (brand text, bordered surface). Pair with the
`animate-toast-slide-in/out` utilities (patterns.md → Motion).

```tsx
import type { HTMLAttributes, ReactNode } from "react";
export type ToastProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };
export function Toast({ children, className, ...props }: ToastProps) {
  return (
    <div role="status"
      className={["inline-flex items-center justify-center rounded-lg border border-border-default bg-bg-default px-(--padding-5) py-(--padding-3) text-body-large-pc whitespace-nowrap text-text-brand drop-shadow-[0_0_4px_var(--color-alpha-black-5)]",
        className].filter(Boolean).join(" ")}
      {...props}>{children}</div>
  );
}
```

## Tooltip

Hover/focus popover. Props: `content`, `children` (trigger), `side` "top" |
"bottom", `className`, `triggerClassName`.

## WheelPicker

iOS-style scroll-snap wheel with N columns (e.g. date/time). Props: `columns:
{ key, options: {value,label}[], value, flex? }[]`, `onChange(key, value)`,
`visibleCount` (default 5).

## Image

`<img>` wrapper with built-in loading + error states. Props: `src`, `alt`
(required), `loadingLabel?`, `errorLabel?`. Use for remote images that may fail.

## Skeleton — full source

```tsx
import type { HTMLAttributes } from "react";
export type SkeletonProps = HTMLAttributes<HTMLDivElement>;
export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div aria-hidden="true"
    className={["animate-skeleton-pulse bg-[var(--color-gray-10)]", className].filter(Boolean).join(" ")}
    {...props} />;
}
// size via className, e.g. <Skeleton className="h-[132px] w-full rounded-2xl" />
```

## LoadingSpinner — full source

Single-layer conic+radial spinner masked to a ring. `text-*` sets color.

```tsx
import type { CSSProperties, HTMLAttributes } from "react";
export type LoadingSpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, "role"> & { size?: number; label?: string };
const FIGMA_BASE = 48, FIGMA_STROKE = 4.8;
export function LoadingSpinner({ size = 24, label = "로딩 중", className, style, ...props }: LoadingSpinnerProps) {
  const stroke = Math.max(2, (size * FIGMA_STROKE) / FIGMA_BASE);
  const s: CSSProperties = {
    width: size, height: size,
    background: [`radial-gradient(farthest-side, currentColor 94%, transparent) top / ${stroke}px ${stroke}px no-repeat`,
      "conic-gradient(transparent 25%, currentColor)"].join(", "),
    WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${stroke}px), #000 0)`,
    mask: `radial-gradient(farthest-side, transparent calc(100% - ${stroke}px), #000 0)`,
    ...style,
  };
  return <span aria-label={label} role="status" style={s}
    className={["inline-block shrink-0 animate-spin rounded-full text-text-brand motion-reduce:animate-none", className].filter(Boolean).join(" ")} {...props} />;
}
```

## Logo

Brand symbol / logotype. `variant="symbol"` (mark only) or `"logotype"`
(mark + "Jellysafe" wordmark). Colored via `text-icon-brand`; override with
`!text-text-inverse` on dark backgrounds. SVG path is the jellyfish mark
(viewBox `0 0 32 32`). See the app repo for the exact `d` string.

## MapPin

Risk-colored map marker (16×40). `status`: safe/caution/danger/critical/primary.
`state`: default | focused (halo) | focused-raised (halo + bob animation).
Optional `label` under the pin. Pair with `react-kakao-maps-sdk`
`CustomOverlayMap` at a coordinate.

```tsx
<CustomOverlayMap position={{lat,lng}} zIndex={selected?20:10} clickable>
  <button aria-label={`${name} 마커`} onClick={...}>
    <MapPin status={risk} state={selected ? "focused-raised" : "default"} label={selected ? name : undefined} />
  </button>
</CustomOverlayMap>
```

## Hook: useScrollIndicator

Returns a ref; while the element scrolls it sets `data-scrolling="true"` so the
`.scrollbar-indicator` thumb shows only during scroll.

```tsx
const ref = useScrollIndicator<HTMLDivElement>();
<div ref={ref} className="scrollbar-indicator overflow-y-auto">…</div>
```
Implementation: attach a `scroll` listener that toggles a
`data-scrolling` attribute, clearing it after a short idle timeout.
