# Setup

## Install this folder as a Claude skill

This `Design/` folder is a self-contained skill (a `SKILL.md` with `references/`).
To make another Claude session use it:

- **Project scope:** copy the folder into the target repo at
  `.claude/skills/jellysafe-design-system/` (so `SKILL.md` sits at
  `.claude/skills/jellysafe-design-system/SKILL.md`).
- **User/global scope:** copy it to `~/.claude/skills/jellysafe-design-system/`
  (macOS/Linux) or `%USERPROFILE%\.claude\skills\jellysafe-design-system\`
  (Windows).

Keep the folder name matching the frontmatter `name` (`jellysafe-design-system`).
Claude auto-discovers skills under those `skills/` directories and loads this
one when a task matches its `description`. You can also invoke it explicitly by
name.

> The folder is portable — it references no repo-specific paths. The component
> code and token CSS in `references/` are copy-paste ready.

## Stack assumptions

- React 19, React DOM 19 (only runtime peer deps).
- Tailwind CSS v4 (uses `@theme`, `@utility`, and `(--var)` arbitrary syntax).
- TypeScript. Components use `"use client"` where they hold state/interactivity.
- No UI/icon library. Icons are inline `currentColor` SVGs (viewBox `0 0 24 24`).

## Wiring Tailwind v4

Create one CSS entry that imports Tailwind then the tokens. Order matters:

```css
@import "tailwindcss";

/* design tokens (see tokens.md + typography.md) */
@import "./styles/primitives.css";   /* :root raw values */
@import "./styles/semantics.css";    /* @theme inline — generates color utils */
@import "./styles/typography.css";   /* @theme — generates text-* utils + font */
@import "./styles/scrollbar.css";    /* scrollbar-indicator / scrollbar-none */
@import "./styles/motion.css";       /* keyframes + animate-* utilities */

/* Tell Tailwind to scan your component sources so utilities aren't purged */
@source "./components";
```

Key rules:

- `semantics.css` uses `@theme inline { --color-bg-default: var(--color-gray-0); ... }`.
  The `inline` keyword makes Tailwind generate `bg-bg-default`, `text-text-primary`,
  etc. that resolve through the primitive vars at runtime.
- `typography.css` uses `@theme { --text-body-large-mobile: 16px; --text-body-large-mobile--line-height: 1.5; ... }`
  so `text-body-large-mobile` sets size + line-height + letter-spacing + weight.
- Primitives live in plain `:root` (not `@theme`) — they are referenced by
  semantics, not meant to be used directly as utilities.

## App CSS baseline

The Public app sets a neutral page background (surface) and the shell paints
white. Minimal global:

```css
html { overscroll-behavior: none; }
body {
  background: var(--color-gray-5);   /* area outside the 430px column */
  color: var(--color-gray-90);
  font-family: var(--font-sans);
  overscroll-behavior: none;
}
```

For iOS safe areas, set the viewport to cover:

```ts
// Next.js: export const viewport
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",     // enables env(safe-area-inset-*)
  themeColor: "#256af4",    // brand (primary-50)
};
```

## Font hosting

Self-host **Pretendard Variable** (`PretendardVariable.woff2`) and reference it
from `/fonts/`. See the `@font-face` block in typography.md. Do not substitute a
different font silently.

## Notes

- `radius` and `shadow` are not formal tokens yet (undefined in the style
  guide). Components use Tailwind radius utilities directly: `rounded-sm` (badge),
  `rounded-lg` (8px — buttons/inputs), `rounded-2xl` (16px — cards/sheets).
  Shadows use one-off `drop-shadow-[...]` / `shadow-[...]` with alpha tokens.
- The design system contains **no** routes, API calls, auth, app state, or
  domain strings. Keep those in the app layer.
