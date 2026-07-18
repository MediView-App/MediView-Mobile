# Typography

Font: **Pretendard Variable** (self-hosted). Every scale shares
`line-height: 1.5` and `letter-spacing: -0.025em`. Each token also carries a
`font-weight`. Utilities are named `text-<role>-<size>-<platform>` and set size +
weight + line-height + letter-spacing together.

## Scale (mobile / pc, with weight)

| Role | Utility (mobile) | size / weight | Utility (pc) | size / weight |
|---|---|---|---|---|
| Heading XL | `text-heading-xlarge-mobile` | 32 / 600 | `text-heading-xlarge-pc` | 40 / 400 |
| Heading L | `text-heading-large-mobile` | 28 / 600 | `text-heading-large-pc` | 32 / 600 |
| Heading M | `text-heading-medium-mobile` | 20 / 600 | `text-heading-medium-pc` | 24 / 600 |
| Heading S | `text-heading-small-mobile` | 18 / 600 | `text-heading-small-pc` | 20 / 600 |
| Heading XS | `text-heading-xsmall-mobile` | 16 / 600 | `text-heading-xsmall-pc` | 18 / 600 |
| Heading XXS | `text-heading-xxsmall-mobile` | 14 / 600 | `text-heading-xxsmall-pc` | 16 / 600 |
| Body L | `text-body-large-mobile` | 16 / 500 | `text-body-large-pc` | 18 / 500 |
| Body M | `text-body-medium-mobile` | 16 / 400 | `text-body-medium-pc` | 18 / 400 |
| Body S | `text-body-small-mobile` | 14 / 600 | `text-body-small-pc` | 16 / 600 |
| Body XS | `text-body-xsmall-mobile` | 14 / 500 | `text-body-xsmall-pc` | 16 / 500 |
| Body XXS | `text-body-xxsmall-mobile` | 14 / 400 | `text-body-xxsmall-pc` | 16 / 400 |
| Caption L | `text-caption-large-mobile` | 12 / 600 | `text-caption-large-pc` | 14 / 600 |
| Caption M | `text-caption-medium-mobile` | 12 / 500 | `text-caption-medium-pc` | 14 / 500 |
| Caption S | `text-caption-small-mobile` | 12 / 400 | `text-caption-small-pc` | 14 / 400 |

Pick `-mobile` in the Public app, `-pc` in Admin. Common roles: page title
`heading-small-mobile`, section title `heading-xsmall-mobile`, body copy
`body-xsmall-mobile`, meta/caption `caption-small-mobile`.

## Paste-ready CSS — `typography.css`

```css
/* Self-host Pretendard Variable at /fonts/ */
@font-face {
  font-family: "Pretendard Variable";
  src: url("/fonts/PretendardVariable.woff2") format("woff2");
  font-weight: 45 920;
  font-style: normal;
  font-display: swap;
}

@theme {
  --font-sans: "Pretendard Variable", -apple-system, BlinkMacSystemFont,
    "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;

  /* Each token needs size + --line-height + --letter-spacing + --font-weight.
     Pattern shown for two entries; replicate for every row in the table. */
  --text-heading-xlarge-pc: 40px;
  --text-heading-xlarge-pc--line-height: 1.5;
  --text-heading-xlarge-pc--letter-spacing: -0.025em;
  --text-heading-xlarge-pc--font-weight: 400;
  --text-heading-xlarge-mobile: 32px;
  --text-heading-xlarge-mobile--line-height: 1.5;
  --text-heading-xlarge-mobile--letter-spacing: -0.025em;
  --text-heading-xlarge-mobile--font-weight: 600;

  --text-heading-large-pc: 32px; /* weight 600 */
  --text-heading-large-mobile: 28px; /* weight 600 */
  --text-heading-medium-pc: 24px; /* 600 */   --text-heading-medium-mobile: 20px; /* 600 */
  --text-heading-small-pc: 20px; /* 600 */    --text-heading-small-mobile: 18px; /* 600 */
  --text-heading-xsmall-pc: 18px; /* 600 */   --text-heading-xsmall-mobile: 16px; /* 600 */
  --text-heading-xxsmall-pc: 16px; /* 600 */  --text-heading-xxsmall-mobile: 14px; /* 600 */

  --text-body-large-pc: 18px; /* 500 */       --text-body-large-mobile: 16px; /* 500 */
  --text-body-medium-pc: 18px; /* 400 */      --text-body-medium-mobile: 16px; /* 400 */
  --text-body-small-pc: 16px; /* 600 */       --text-body-small-mobile: 14px; /* 600 */
  --text-body-xsmall-pc: 16px; /* 500 */      --text-body-xsmall-mobile: 14px; /* 500 */
  --text-body-xxsmall-pc: 16px; /* 400 */     --text-body-xxsmall-mobile: 14px; /* 400 */

  --text-caption-large-pc: 14px; /* 600 */    --text-caption-large-mobile: 12px; /* 600 */
  --text-caption-medium-pc: 14px; /* 500 */   --text-caption-medium-mobile: 12px; /* 500 */
  --text-caption-small-pc: 14px; /* 400 */    --text-caption-small-mobile: 12px; /* 400 */

  /* For every token above, also emit the three companion props:
       --<token>--line-height: 1.5;
       --<token>--letter-spacing: -0.025em;
       --<token>--font-weight: <weight from the table>;
     (Only the first two tokens are fully expanded here to keep this readable —
     expand all rows the same way in the real file.) */
}
```

> When generating the real `typography.css`, expand every row to include its
> four properties (`size`, `--line-height: 1.5`, `--letter-spacing: -0.025em`,
> `--font-weight` from the table). The abbreviated block above documents the
> values; don't ship it abbreviated.
