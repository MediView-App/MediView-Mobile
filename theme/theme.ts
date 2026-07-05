import { useColorScheme } from "react-native";
import {
  lightColors,
  darkColors,
  spacing,
  radius,
  typography,
  elevation,
  type ThemeColors,
} from "./tokens";

export type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  elevation: typeof elevation;
  isDark: boolean;
};

/** 시스템 라이트/다크에 따라 역할 색을 반환한다. */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return {
    colors: isDark ? darkColors : lightColors,
    spacing,
    radius,
    typography,
    elevation,
    isDark,
  };
}
