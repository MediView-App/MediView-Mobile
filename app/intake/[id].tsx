import { useState } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { FooterCTA } from "../booking/[id]";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";

const durations = ["오늘", "2~3일", "1주일 이상", "한 달 이상"];
const conditions = ["고혈압", "당뇨", "알레르기", "임신 중", "복용 중인 약"];

export default function Intake() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spacing, colors, radius } = useTheme();
  const router = useRouter();
  const [symptom, setSymptom] = useState("");
  const [dur, setDur] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (c: string) =>
    setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  return (
    <>
      <Header title="문진 작성" />
      <Screen contentStyle={{ paddingBottom: 120 }}>
        <View style={[styles.notice, { backgroundColor: palette.primary[50] }]}>
          <Ionicons name="lock-closed" size={16} color={colors.brand} />
          <Text variant="caption" color="brandInk" style={{ flex: 1, lineHeight: 18 }}>
            입력하신 내용의 민감정보는 자동 마스킹되어 안전하게 전달됩니다.
          </Text>
        </View>

        {/* 증상 */}
        <Text variant="h3" style={{ marginTop: spacing.x6, marginBottom: spacing.x2 }}>
          어떤 증상이 있나요?
        </Text>
        <TextInput
          value={symptom}
          onChangeText={setSymptom}
          placeholder="예: 어제부터 기침과 콧물이 있고, 미열이 있어요."
          placeholderTextColor={colors.subtle}
          multiline
          style={{
            minHeight: 110,
            textAlignVertical: "top",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
            borderRadius: radius.md,
            padding: 14,
            color: colors.content,
            fontSize: 15,
            lineHeight: 22,
          }}
        />

        {/* 기간 */}
        <Text variant="h3" style={{ marginTop: spacing.x6, marginBottom: spacing.x3 }}>
          증상이 얼마나 지속됐나요?
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {durations.map((d) => {
            const active = dur === d;
            return (
              <Pressable
                key={d}
                onPress={() => setDur(d)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: radius.full,
                  backgroundColor: active ? colors.brand : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? colors.brand : colors.line,
                }}
              >
                <Text
                  variant="small"
                  style={{ color: active ? colors.onBrand : colors.muted, fontWeight: "600" }}
                >
                  {d}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 해당사항 */}
        <Text variant="h3" style={{ marginTop: spacing.x6, marginBottom: spacing.x3 }}>
          해당하는 항목을 선택하세요
        </Text>
        <View style={{ gap: spacing.x2 }}>
          {conditions.map((c) => {
            const active = picked.includes(c);
            return (
              <Pressable
                key={c}
                onPress={() => toggle(c)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: active ? colors.brand : colors.line,
                  borderRadius: radius.md,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <Text variant="body">{c}</Text>
                <Ionicons
                  name={active ? "checkbox" : "square-outline"}
                  size={22}
                  color={active ? colors.brand : colors.subtle}
                />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: spacing.x5,
            paddingVertical: 16,
            borderRadius: radius.md,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: colors.lineStrong,
          }}
        >
          <Ionicons name="camera-outline" size={20} color={colors.muted} />
          <Text variant="small" color="muted">
            사진 첨부 (선택)
          </Text>
        </Pressable>
      </Screen>

      <FooterCTA
        label="제출하고 예약 완료"
        onPress={() => router.replace("/(tabs)/appointments")}
      />
    </>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    alignItems: "flex-start",
  },
});
