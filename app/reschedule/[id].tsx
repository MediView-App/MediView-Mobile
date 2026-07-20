import { useMemo, useState } from "react";
import { View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { useTheme } from "@/theme/theme";
import { useAppointment } from "@/lib/useAppointment";
import { generateSlots, toLocalDateTimeString } from "@/lib/slots";
import { rescheduleAppointment } from "@/api/appointments";

export default function Reschedule() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const appt = useAppointment(id);

  // 화면 진입 시점 기준으로 고정(렌더마다 슬롯이 흔들리지 않도록).
  const slots = useMemo(() => generateSlots(new Date(), 8), []);
  const [picked, setPicked] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (picked === null) return;
    setSaving(true);
    try {
      await rescheduleAppointment(String(id), toLocalDateTimeString(slots[picked].date));
      toast.show(`${slots[picked].label}으로 변경되었어요.`);
      router.back();
    } catch (e) {
      // 서버가 거부한 사유(진행 중/이미 완료 등)를 그대로 노출한다.
      toast.show(e instanceof Error ? e.message : "일정을 변경하지 못했어요.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header title="일정 변경" />
      <Screen contentStyle={{ paddingBottom: 120 }}>
        {/* 현재 예약 */}
        <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Avatar name={appt?.doctorName ?? "의료진"} size={48} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{appt?.doctorName ?? "담당 의료진"}</Text>
            <Text variant="small" color="muted">
              현재 일시 · {appt?.when ?? "-"}
            </Text>
          </View>
        </Card>

        <Text variant="h3" style={{ marginTop: spacing.x6, marginBottom: spacing.x3 }}>
          변경할 시간 선택
        </Text>

        {slots.length === 0 ? (
          <Card>
            <Text variant="small" color="muted">
              오늘 남은 시간이 없어요. 잠시 후 다시 확인해 주세요.
            </Text>
          </Card>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {slots.map((s, i) => {
              const active = picked === i;
              return (
                <Pressable
                  key={s.label}
                  onPress={() => setPicked(i)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: radius.md,
                    backgroundColor: active ? colors.brand : colors.surface,
                    borderWidth: 1,
                    borderColor: active ? colors.brand : colors.line,
                  }}
                >
                  <Text
                    variant="small"
                    style={{ color: active ? colors.onBrand : colors.content, fontWeight: "600" }}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 8, marginTop: spacing.x5 }}>
          <Ionicons name="information-circle-outline" size={16} color={colors.subtle} />
          <Text variant="caption" color="subtle" style={{ flex: 1, lineHeight: 18 }}>
            이미 시작된 진료는 변경할 수 없습니다. 변경 시 대기 순번은 초기화됩니다.
          </Text>
        </View>

        <Button
          label={saving ? "변경 중…" : picked === null ? "시간을 선택하세요" : "이 시간으로 변경"}
          full
          disabled={picked === null || saving}
          onPress={submit}
          style={{ marginTop: spacing.x6 }}
        />
      </Screen>
    </>
  );
}
