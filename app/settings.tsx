import { useState } from "react";
import { View, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";

type ToggleRow = { icon: keyof typeof Ionicons.glyphMap; label: string; desc?: string };

const groups: { title: string; rows: ToggleRow[] }[] = [
  {
    title: "알림",
    rows: [
      { icon: "notifications-outline", label: "진료 알림", desc: "예약·진료 시작 알림" },
      { icon: "card-outline", label: "결제 알림" },
      { icon: "megaphone-outline", label: "마케팅 정보 수신" },
    ],
  },
  {
    title: "보안",
    rows: [
      { icon: "finger-print-outline", label: "생체 인증 잠금", desc: "앱 실행 시 Face/Touch ID" },
      { icon: "eye-off-outline", label: "민감정보 가리기" },
    ],
  },
];

export default function Settings() {
  const { colors, spacing, radius } = useTheme();
  const [on, setOn] = useState<Record<string, boolean>>({
    "진료 알림": true,
    "결제 알림": true,
    "생체 인증 잠금": true,
  });

  return (
    <>
      <Header title="설정" />
      <Screen>
        {groups.map((g) => (
          <View key={g.title} style={{ marginBottom: spacing.x6 }}>
            <Text variant="overline" color="subtle" style={{ marginBottom: spacing.x3 }}>
              {g.title}
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.line,
                overflow: "hidden",
              }}
            >
              {g.rows.map((r, i) => (
                <View
                  key={r.label}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: colors.line,
                  }}
                >
                  <Ionicons name={r.icon} size={20} color={colors.muted} />
                  <View style={{ flex: 1 }}>
                    <Text variant="body">{r.label}</Text>
                    {r.desc ? (
                      <Text variant="caption" color="subtle">
                        {r.desc}
                      </Text>
                    ) : null}
                  </View>
                  <Switch
                    value={!!on[r.label]}
                    onValueChange={(v) => setOn((s) => ({ ...s, [r.label]: v }))}
                    trackColor={{ true: colors.brand, false: colors.line }}
                    thumbColor={palette.white}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text variant="caption" color="subtle" center>
          테마는 기기의 라이트/다크 설정을 따릅니다.
        </Text>
      </Screen>
    </>
  );
}
