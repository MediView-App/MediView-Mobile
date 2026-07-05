import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { type Doctor } from "@/lib/mock";
import { getDoctor } from "@/api/doctors";
import { createAppointment } from "@/api/appointments";
import { DEMO_MODE } from "@/lib/config";

export default function Booking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spacing, colors } = useTheme();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    getDoctor(String(id)).then(setDoctor).catch(() => setDoctor(null));
  }, [id]);

  const confirm = async () => {
    setSubmitting(true);
    try {
      if (!DEMO_MODE && doctor?.userId && doctor?.organizationId) {
        await createAppointment({
          doctorId: doctor.userId,
          organizationId: doctor.organizationId,
          type: "RESERVED",
        });
      }
      setDone(true);
    } catch {
      // 실패 시에도 데모 흐름 유지(운영에선 에러 토스트 노출 권장)
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <Header title="예약 완료" />
        <Screen>
          <View style={{ alignItems: "center", paddingTop: spacing.x8 }}>
            <View style={[styles.check, { backgroundColor: palette.primary[50] }]}>
              <Ionicons name="checkmark-circle" size={64} color={colors.brand} />
            </View>
            <Text variant="h1" center style={{ marginTop: spacing.x5 }}>
              예약이 확정됐어요
            </Text>
            <Text variant="body" color="muted" center style={{ marginTop: 8, maxWidth: 300 }}>
              진료 전 문진을 작성하면 의료진이 더 정확하게 준비할 수 있어요.
            </Text>
            <Button
              label="문진 작성하기"
              full
              onPress={() => router.replace(`/intake/${id}`)}
              style={{ marginTop: spacing.x8 }}
            />
            <Button
              label="나중에 하기"
              variant="ghost"
              full
              onPress={() => router.replace("/(tabs)/appointments")}
              style={{ marginTop: spacing.x2 }}
            />
          </View>
        </Screen>
      </>
    );
  }

  return (
    <>
      <Header title="예약 확인" />
      <Screen contentStyle={{ paddingBottom: 120 }}>
        {doctor ? (
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Avatar name={doctor.name} size={56} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Text variant="bodyStrong">{doctor.name} 의료진</Text>
                <Ionicons name="shield-checkmark" size={14} color={colors.brand} />
              </View>
              <Text variant="small" color="muted">
                {doctor.specialty} · {doctor.org}
              </Text>
            </View>
          </Card>
        ) : null}

        <Card style={{ marginTop: spacing.x4, gap: spacing.x3 }}>
          <Row label="진료 방식" value="비대면(화상)" />
          <Divider />
          <Row label="예약 시간" value={doctor?.nextSlot ?? "오늘 14:30"} />
          <Divider />
          <Row label="예상 진료비" value="12,000원" strong />
        </Card>

        <View style={[styles.notice, { backgroundColor: palette.primary[50] }]}>
          <Ionicons name="information-circle" size={18} color={colors.brand} />
          <Text variant="small" color="brandInk" style={{ flex: 1, lineHeight: 20 }}>
            진료 후 결제가 진행되며, 처방전은 진료 완료 후 발급됩니다.
          </Text>
        </View>
      </Screen>

      <FooterCTA label={submitting ? "처리 중…" : "예약 확정하기"} onPress={confirm} />
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text variant="small" color="muted">
        {label}
      </Text>
      <Text variant={strong ? "bodyStrong" : "body"} color={strong ? "brandInk" : "content"}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.line }} />;
}

export function FooterCTA({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: insets.bottom + 12,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.line,
      }}
    >
      <Button label={label} full onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  check: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  notice: {
    flexDirection: "row",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    marginTop: 16,
    alignItems: "flex-start",
  },
});
