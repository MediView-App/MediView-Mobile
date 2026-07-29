import { useState } from "react";
import { View, TextInput, Pressable, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/theme";
import { Text } from "./Text";

type InputProps = TextInputProps & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
  error?: string;
};

export function Input({ label, icon, secure, error, style, ...rest }: InputProps) {
  const { colors, radius } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  const borderColor = error
    ? colors.accent
    : focused
    ? colors.brand
    : colors.line;

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text variant="small" color="muted" style={{ fontWeight: "600" }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor,
          borderRadius: radius.md,
          paddingHorizontal: 14,
        }}
      >
        {icon ? <Ionicons name={icon} size={18} color={colors.subtle} /> : null}
        <TextInput
          style={[{ flex: 1, color: colors.content, fontSize: 16, paddingVertical: 14 }, style]}
          placeholderTextColor={colors.subtle}
          secureTextEntry={hidden}
          // 오류가 있으면 스크린리더가 필드와 함께 오류를 읽도록 라벨에 포함한다.
          accessibilityLabel={error ? `${label ?? "입력"}, 오류: ${error}` : label}
          maxFontSizeMultiplier={2}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "비밀번호 표시" : "비밀번호 숨기기"}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={colors.subtle}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        // 시각 사용자용 오류. 스크린리더는 위 입력 라벨로 오류를 받으므로 중복 낭독을 막는다.
        <Text
          variant="caption"
          style={{ color: colors.accent }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
