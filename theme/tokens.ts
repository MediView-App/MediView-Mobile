/**
 * MediView Design System — "Calm Care" (React Native)
 * design/DESIGN_SYSTEM.md 의 단일 원본을 RN 값으로 미러링한다.
 * 웹(landing/app/globals.css)과 동일한 팔레트·스케일을 유지할 것.
 */

export const palette = {
  primary: {
    50: "#ECFBFA",
    100: "#CFF5F3",
    200: "#A2EAE7",
    300: "#6DD9D6",
    400: "#38C0C0",
    500: "#12A3A8",
    600: "#0E858A",
    700: "#0D6B70",
    800: "#10565A",
    900: "#0E4548",
  },
  accent: { 400: "#FF9A8B", 500: "#FB7060", 600: "#E85647" },
  neutral: {
    0: "#FFFFFF",
    50: "#F6F8F9",
    100: "#EDF1F3",
    200: "#E1E7EA",
    300: "#C6D0D5",
    400: "#98A5AC",
    500: "#6A7880",
    600: "#4C585F",
    700: "#384249",
    800: "#232A2F",
    900: "#141A1D",
    ink: "#0F1518",
  },
  success: "#1FA971",
  warning: "#E8A33D",
  danger: "#E5484D",
  info: "#3E7BC9",
  white: "#FFFFFF",
} as const;

/** 역할(role) 색 — 테마별로 값이 바뀐다. */
export type ThemeColors = {
  canvas: string;
  surface: string;
  surface2: string;
  line: string;
  lineStrong: string;
  content: string;
  muted: string;
  subtle: string;
  brand: string;
  brandInk: string;
  accent: string;
  onBrand: string;
};

export const lightColors: ThemeColors = {
  canvas: palette.neutral[50],
  surface: palette.neutral[0],
  surface2: palette.neutral[100],
  line: palette.neutral[200],
  lineStrong: palette.neutral[300],
  content: palette.neutral.ink,
  muted: palette.neutral[500],
  subtle: palette.neutral[400],
  brand: palette.primary[500],
  brandInk: palette.primary[700],
  accent: palette.accent[500],
  onBrand: palette.white,
};

export const darkColors: ThemeColors = {
  canvas: "#0F1518",
  surface: "#161D21",
  surface2: "#1D262B",
  line: "#273239",
  lineStrong: "#35434B",
  content: "#EAF0F1",
  muted: "#9AA7AE",
  subtle: "#6A7880",
  brand: palette.primary[400],
  brandInk: palette.primary[300],
  accent: palette.accent[400],
  onBrand: palette.white,
};

/** 4px 그리드 */
export const spacing = {
  x0: 0,
  x1: 4,
  x2: 8,
  x3: 12,
  x4: 16,
  x5: 20,
  x6: 24,
  x8: 32,
  x10: 40,
  x12: 48,
  x16: 64,
  x20: 80,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  full: 9999,
} as const;

/** 모바일 타이포 스케일 */
export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: "800" as const, letterSpacing: -0.5 },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: "700" as const, letterSpacing: -0.4 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: "700" as const, letterSpacing: -0.2 },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: "600" as const },
  small: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "500" as const },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: "700" as const, letterSpacing: 1 },
} as const;

export const elevation = {
  e1: {
    shadowColor: "#141A1D",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  e2: {
    shadowColor: "#141A1D",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
