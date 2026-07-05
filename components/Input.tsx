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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={colors.subtle}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" style={{ color: colors.accent }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
