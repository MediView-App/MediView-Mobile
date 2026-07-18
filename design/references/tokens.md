# Tokens

Three layers: **primitive** (raw values in `:root`) → **semantic** (roles, in
`@theme inline`) → components. Never use a primitive directly in a component;
always go through a semantic token.

## Risk color scale (domain-critical)

JellySafe uses a **4-level risk scale** everywhere. Always pair color with text
(never color alone). Note `caution` maps to the **caution-30** ramp, others to
their `-50`.

| Level | Korean | Ramp | Badge text | Meaning |
|---|---|---|---|---|
| `safe` | 안전 | safe-50 `#228756` | safe-50 | normal use |
| `caution` | 주의 | caution-30 `#ffd014` | caution-50 `#9e7e00` | possible |
| `danger` | 위험 | danger-50 `#e43e0c` | danger-50 | likely |
| `critical` | 심각 | critical-50 `#de122a` | critical-50 | severe / avoid entry |

Backend uses `severe`; the frontend maps `severe → critical`.

Badge/banner recipe: background = status color mixed 25% over white/transparent,
text = the status `-50`. Example:
`bg-[color-mix(in_srgb,var(--color-safe-50)_25%,white)] text-[var(--color-safe-50)]`.

## Primitive colors

- **primary** (brand blue): 5 `#eceffe`, 10 `#d8e4fd`, 20 `#b1cafb`, 30 `#86acf9`,
  40 `#4c85f6`, **50 `#256af4`**, 60 `#0b4dd0`, 70 `#083691`, 80 `#052461`,
  90 `#03153a`, 95 `#020e27`.
- **gray**: 0 `#ffffff`, 5 `#f9fafb`, 10 `#eeeff1`, 20 `#c7ccd1`, 30 `#aab2bb`,
  40 `#8b95a1`, 50 `#67717e`, 60 `#545d68`, 70 `#444c55`, 80 `#2e3338`,
  90 `#17191c`, 95 `#0b0d0e`, 100 `#080808`.
- **critical** (red): 5 `#fdecee` … 50 `#de122a` … 90 `#39050b`.
- **danger** (orange-red): 5 `#feefeb` … 50 `#e43e0c` … 90 `#3b1003`.
- **caution** (yellow): 5 `#fff8db`, 10 `#ffeda3`, 20 `#ffde5c`, 30 `#ffd014`,
  40 `#c79f00`, 50 `#9e7e00` … 95 `#241d00`.
- **safe** (green): 5 `#eaf6f0` … 50 `#228756` … 95 `#0e2017`.
- **alpha black / white**: 0, 5, 10, 25, 50, 75, 100 opacity steps over
  `#000` / `#fff` (e.g. `--color-alpha-black-50: rgba(0,0,0,0.5)`).

## Spacing scale

Two parallel scales (kept separate from Tailwind's default `--spacing-*`):

- **gap** (`--gap-1..12`): 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 px →
  used as `gap-(--gap-3)`.
- **padding** (`--padding-1..10`): 2, 4, 8, 12, 16, 20, 24, 32, 40, 64 px →
  used as `px-(--padding-5)`, `py-(--padding-4)`.

## Icon sizes

`--icon-size-{12,16,20,24,32,40}` (base 24) → `size-(--icon-size-24)`.

## Semantic tokens (roles)

Generated as color utilities via `@theme inline`. Common ones:

- **background:** `bg-default` (gray-0/white), `bg-surface` (gray-5),
  `bg-muted` (gray-20), `bg-dim` (black 50% — overlays), `bg-strong` (primary-50),
  `bg-dark` (gray-80), `bg-error` (critical-50).
- **text:** `text-primary` (gray-90), `text-secondary` (gray-70),
  `text-tertiary` (gray-50), `text-disabled` (gray-40), `text-brand` (primary-50),
  `text-inverse` (gray-0), `text-error` (critical-50).
- **icon:** `icon-primary` (gray-80), `icon-secondary` (gray-50),
  `icon-tertiary` (gray-40), `icon-brand` (primary-50), `icon-inverse` (gray-0).
- **border:** `border-default` (gray-10), `border-strong` (gray-90),
  `border-subtle` (gray-5), `border-error` (critical-50), `border-brand` (primary-50).
- **state:** `state-selected` (primary-10), `state-pressed` (primary-70),
  `state-disabled` (gray-10).
- **button:** primary fill/hover/pressed (primary-50/60/70), secondary
  fill/hover/pressed (primary-5/10/20) + border (primary-50), tertiary
  fill/hover/selected/pressed (gray-5/10 / primary-10 / gray-20) + border (gray-10),
  disabled fill/border (gray-20/gray-30).

Usage: `bg-bg-default`, `text-text-primary`, `border-border-default`,
`text-icon-brand`, `bg-button-primary-fill`, etc.

## Paste-ready CSS — `primitives.css`

```css
/* Primitive tokens — raw style-guide values (prefer semantics via reference) */
:root {
  /* primary */
  --color-primary-95: #020e27; --color-primary-90: #03153a;
  --color-primary-80: #052461; --color-primary-70: #083691;
  --color-primary-60: #0b4dd0; --color-primary-50: #256af4;
  --color-primary-40: #4c85f6; --color-primary-30: #86acf9;
  --color-primary-20: #b1cafb; --color-primary-10: #d8e4fd;
  --color-primary-5: #eceffe;

  /* gray */
  --color-gray-100: #080808; --color-gray-95: #0b0d0e; --color-gray-90: #17191c;
  --color-gray-80: #2e3338; --color-gray-70: #444c55; --color-gray-60: #545d68;
  --color-gray-50: #67717e; --color-gray-40: #8b95a1; --color-gray-30: #aab2bb;
  --color-gray-20: #c7ccd1; --color-gray-10: #eeeff1; --color-gray-5: #f9fafb;
  --color-gray-0: #ffffff;

  /* critical */
  --color-critical-90: #39050b; --color-critical-80: #5c0a14;
  --color-critical-70: #8a0f1d; --color-critical-60: #bd0f23;
  --color-critical-50: #de122a; --color-critical-40: #f04256;
  --color-critical-30: #f47180; --color-critical-20: #f7a1ab;
  --color-critical-10: #fcd9dd; --color-critical-5: #fdecee;

  /* danger */
  --color-danger-90: #3b1003; --color-danger-80: #611b05;
  --color-danger-70: #912808; --color-danger-60: #c2350a;
  --color-danger-50: #e43e0c; --color-danger-40: #f5683d;
  --color-danger-30: #f78e6e; --color-danger-20: #fab49e;
  --color-danger-10: #fde1d8; --color-danger-5: #feefeb;

  /* caution */
  --color-caution-95: #241d00; --color-caution-90: #2e2500;
  --color-caution-80: #423500; --color-caution-70: #614e00;
  --color-caution-60: #8a6e00; --color-caution-50: #9e7e00;
  --color-caution-40: #c79f00; --color-caution-30: #ffd014;
  --color-caution-20: #ffde5c; --color-caution-10: #ffeda3;
  --color-caution-5: #fff8db;

  /* safe */
  --color-safe-95: #0e2017; --color-safe-90: #122b1f; --color-safe-80: #1f4734;
  --color-safe-70: #285d43; --color-safe-60: #26734e; --color-safe-50: #228756;
  --color-safe-40: #3fa674; --color-safe-30: #7ec8a4; --color-safe-20: #a9dac2;
  --color-safe-10: #d8eee3; --color-safe-5: #eaf6f0;

  /* alpha black / white */
  --color-alpha-black-100: rgba(0,0,0,1);   --color-alpha-black-75: rgba(0,0,0,.75);
  --color-alpha-black-50: rgba(0,0,0,.5);   --color-alpha-black-25: rgba(0,0,0,.25);
  --color-alpha-black-10: rgba(0,0,0,.1);   --color-alpha-black-5: rgba(0,0,0,.05);
  --color-alpha-black-0: rgba(0,0,0,0);
  --color-alpha-white-100: rgba(255,255,255,1);  --color-alpha-white-75: rgba(255,255,255,.75);
  --color-alpha-white-50: rgba(255,255,255,.5);  --color-alpha-white-25: rgba(255,255,255,.25);
  --color-alpha-white-10: rgba(255,255,255,.1);  --color-alpha-white-5: rgba(255,255,255,.05);
  --color-alpha-white-0: rgba(255,255,255,0);

  /* spacing: gap */
  --gap-1: 2px; --gap-2: 4px; --gap-3: 8px; --gap-4: 12px; --gap-5: 16px;
  --gap-6: 20px; --gap-7: 24px; --gap-8: 32px; --gap-9: 40px; --gap-10: 48px;
  --gap-11: 64px; --gap-12: 80px;

  /* spacing: padding */
  --padding-1: 2px; --padding-2: 4px; --padding-3: 8px; --padding-4: 12px;
  --padding-5: 16px; --padding-6: 20px; --padding-7: 24px; --padding-8: 32px;
  --padding-9: 40px; --padding-10: 64px;

  /* icon size (base 24) */
  --icon-size-12: 12px; --icon-size-16: 16px; --icon-size-20: 20px;
  --icon-size-24: 24px; --icon-size-32: 32px; --icon-size-40: 40px;
}
```

## Paste-ready CSS — `semantics.css`

```css
/* Semantic tokens — reference primitives; @theme inline generates color utils */
@theme inline {
  /* background */
  --color-bg-default: var(--color-gray-0);
  --color-bg-surface: var(--color-gray-5);
  --color-bg-muted: var(--color-gray-20);
  --color-bg-dim: var(--color-alpha-black-50);
  --color-bg-strong: var(--color-primary-50);
  --color-bg-dark: var(--color-gray-80);
  --color-bg-error: var(--color-critical-50);

  /* border */
  --color-border-default: var(--color-gray-10);
  --color-border-strong: var(--color-gray-90);
  --color-border-subtle: var(--color-gray-5);
  --color-border-error: var(--color-critical-50);
  --color-border-brand: var(--color-primary-50);

  /* text */
  --color-text-primary: var(--color-gray-90);
  --color-text-secondary: var(--color-gray-70);
  --color-text-tertiary: var(--color-gray-50);
  --color-text-disabled: var(--color-gray-40);
  --color-text-brand: var(--color-primary-50);
  --color-text-inverse: var(--color-gray-0);
  --color-text-error: var(--color-critical-50);

  /* icon */
  --color-icon-primary: var(--color-gray-80);
  --color-icon-secondary: var(--color-gray-50);
  --color-icon-tertiary: var(--color-gray-40);
  --color-icon-brand: var(--color-primary-50);
  --color-icon-inverse: var(--color-gray-0);

  /* state */
  --color-state-selected: var(--color-primary-10);
  --color-state-pressed: var(--color-primary-70);
  --color-state-disabled: var(--color-gray-10);

  /* button */
  --color-button-primary-fill: var(--color-primary-50);
  --color-button-primary-fill-hover: var(--color-primary-60);
  --color-button-primary-fill-pressed: var(--color-primary-70);
  --color-button-secondary-fill: var(--color-primary-5);
  --color-button-secondary-fill-hover: var(--color-primary-10);
  --color-button-secondary-fill-pressed: var(--color-primary-20);
  --color-button-secondary-border: var(--color-primary-50);
  --color-button-tertiary-fill: var(--color-gray-5);
  --color-button-tertiary-fill-hover: var(--color-gray-10);
  --color-button-tertiary-fill-selected: var(--color-primary-10);
  --color-button-tertiary-fill-pressed: var(--color-gray-20);
  --color-button-tertiary-border: var(--color-gray-10);
  --color-button-disabled-fill: var(--color-gray-20);
  --color-button-disabled-border: var(--color-gray-30);
}
```

## Paste-ready CSS — `scrollbar.css`

```css
/* scrollbar-indicator: thumb only while scrolling (set data-scrolling="true"
   on the element during scroll — see useScrollIndicator in components.md). */
.scrollbar-indicator::-webkit-scrollbar { width:4px; height:4px; background:transparent; }
.scrollbar-indicator::-webkit-scrollbar-track,
.scrollbar-indicator::-webkit-scrollbar-track-piece { background:transparent; border:none; box-shadow:none; }
.scrollbar-indicator::-webkit-scrollbar-thumb { background-color:transparent; border-radius:9999px; border:none; box-shadow:none; }
.scrollbar-indicator::-webkit-scrollbar-corner { background:transparent; }
.scrollbar-indicator::-webkit-scrollbar-button { display:none; width:0; height:0; }
.scrollbar-indicator[data-scrolling="true"]::-webkit-scrollbar-thumb { background-color: var(--color-gray-20); }
@supports not selector(::-webkit-scrollbar) {
  .scrollbar-indicator { scrollbar-width:thin; scrollbar-color:transparent transparent; }
  .scrollbar-indicator[data-scrolling="true"] { scrollbar-color: var(--color-gray-20) transparent; }
}
.scrollbar-none { scrollbar-width:none; }
.scrollbar-none::-webkit-scrollbar { display:none; }
```

Motion tokens live in typography.md's sibling `motion.css` — see patterns.md
(Motion).
