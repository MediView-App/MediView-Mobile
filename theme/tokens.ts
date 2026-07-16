/**
 * MediView Design System (React Native) — JellySafe 토큰 적용본.
 * mobile/design(JellySafe) 의 primitive/semantic/typography 를 RN 값으로 미러링한다.
 *   - Primary: Blue #256AF4  ·  Neutral: Gray ramp  ·  Status: safe/caution/danger/critical
 *   - Font: Pretendard  ·  자간 -0.025em  ·  역할별 굵기
 * 앱 전 컴포넌트가 useTheme() 로 이 토큰을 소비하므로, 여기 값만 바꾸면 전체가 리스킨된다.
 */

export const palette = {
  // primary (JellySafe blue): 50=주:최연함 … 900=가장 진함. 키는 기존과 동일하게 유지.
  primary: {
    50: "#ECEFFE", // JS primary-5  (light tint bg)
    100: "#D8E4FD", // primary-10
    200: "#B1CAFB", // primary-20
    300: "#86ACF9", // primary-30
    400: "#4C85F6", // primary-40
    500: "#256AF4", // primary-50 (brand)
    600: "#0B4DD0", // primary-60
    700: "#083691", // primary-70
    800: "#052461", // primary-80
    900: "#03153A", // primary-90
  },
  // 보조 강조(장식) — JellySafe 에 별도 warm accent 가 없어 브랜드 블루 톤으로 통일.
  accent: { 400: "#4C85F6", 500: "#256AF4", 600: "#0B4DD0" },
  neutral: {
    0: "#FFFFFF",
    50: "#F9FAFB", // gray-5
    100: "#EEEFF1", // gray-10
    200: "#C7CCD1", // gray-20
    300: "#AAB2BB", // gray-30
    400: "#8B95A1", // gray-40
    500: "#67717E", // gray-50
    600: "#545D68", // gray-60
    700: "#444C55", // gray-70
    800: "#2E3338", // gray-80
    900: "#17191C", // gray-90
    ink: "#0B0D0E", // gray-95 (최상위 텍스트)
  },
  // 상태색 — JellySafe 4단계 리스크 스케일의 -50 (아이콘/보더용 솔리드).
  success: "#228756", // safe-50
  warning: "#C79F00", // caution-40 (아이콘/보더)
  danger: "#DE122A", // critical-50
  info: "#256AF4", // primary-50
  white: "#FFFFFF",
} as const;

/** 역할(role) 색 — 테마별로 값이 바뀐다. (semantic tokens) */
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
  canvas: palette.neutral[50], // gray-5  (화면 배경: 카드가 도드라지도록 살짝 그레이)
  surface: palette.neutral[0], // white   (카드/시트)
  surface2: palette.neutral[100], // gray-10 (인셋/토글 트랙)
  line: palette.neutral[100], // gray-10 (기본 보더)
  lineStrong: palette.neutral[200], // gray-20
  content: palette.neutral[900], // gray-90 (text-primary)
  muted: palette.neutral[700], // gray-70 (text-secondary)
  subtle: palette.neutral[500], // gray-50 (text-tertiary)
  brand: palette.primary[500], // #256AF4
  brandInk: palette.primary[700], // #083691 (틴트 위 강한 브랜드 텍스트)
  accent: palette.danger, // 에러 역할(Input/결제 오류) = critical red
  onBrand: palette.white,
};

export const darkColors: ThemeColors = {
  canvas: "#0B0D0E", // gray-95
  surface: "#17191C", // gray-90
  surface2: "#22262B",
  line: "#2E3338", // gray-80
  lineStrong: "#444C55", // gray-70
  content: "#EEEFF1", // gray-10
  muted: "#AAB2BB", // gray-30
  subtle: "#8B95A1", // gray-40
  brand: palette.primary[400], // #4C85F6 (다크에서 밝은 블루)
  brandInk: palette.primary[300], // #86ACF9
  accent: "#F04256", // critical-40
  onBrand: palette.white,
};

/** 4px 그리드 (JellySafe gap/padding 스케일과 동일 계열) */
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

/**
 * 모바일 타이포 스케일 — JellySafe(Pretendard) 기반.
 * 자간은 -0.025em 을 픽셀로 근사(≈ -0.025 × fontSize), 역할별 굵기 적용.
 */
export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: "700" as const, letterSpacing: -0.8 },
  h1: { fontSize: 28, lineHeight: 36, fontWeight: "700" as const, letterSpacing: -0.7 },
  h2: { fontSize: 22, lineHeight: 30, fontWeight: "700" as const, letterSpacing: -0.55 },
  h3: { fontSize: 18, lineHeight: 26, fontWeight: "600" as const, letterSpacing: -0.45 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const, letterSpacing: -0.2 },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: "600" as const, letterSpacing: -0.2 },
  small: { fontSize: 14, lineHeight: 21, fontWeight: "400" as const, letterSpacing: -0.2 },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: "500" as const, letterSpacing: -0.15 },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: "700" as const, letterSpacing: 0.4 },
} as const;

export const elevation = {
  e1: {
    shadowColor: "#0B0D0E",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  e2: {
    shadowColor: "#0B0D0E",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
