import { View, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { appointments, statusLabel } from "@/lib/mock";
import { useAuth } from "@/context/AuthContext";

export default function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const isDoctor = user?.role === "DOCTOR";
  const appt = appointments.find((a) => a.id === id) ?? appointments[0];
  const active = appt.status !== "COMPLETED";

  const cancel = () =>
    Alert.alert("예약 취소", "이 예약을 취소할까요?", [
      { text: "닫기", style: "cancel" },
      {
        text: "취소하기",
        style: "destructive",
        onPress: () => router.replace("/(tabs)/appointments"),
      },
    ]);

  return (
    <>
      <Header title="예약 상세" />
      <Screen>
        <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Avatar name={appt.doctor} size={56} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{appt.doctor} 의료진</Text>
            <Text variant="small" color="muted">
              {appt.specialty}
            </Text>
          </View>
          <Badge tone={active ? "brand" : "neutral"} label={statusLabel[appt.status]} />
        </Card>

        <Card style={{ marginTop: spacing.x4, gap: spacing.x3 }}>
          <Row icon="calendar-outline" label="일시" value={appt.when} />
          <Divider />
          <Row icon="videocam-outline" label="진료 방식" value="비대면(화상)" />
          <Divider />
          <Row icon="card-outline" label="예상 진료비" value="12,000원" />
        </Card>

        {active ? (
          <View style={{ marginTop: spacing.x6, gap: spacing.x2 }}>
            <Button
              label={isDoctor ? "진료 시작" : "진료실 입장"}
              full
              onPress={() => router.push(isDoctor ? "/consult/1" : `/waiting/${appt.id}`)}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button
                label="채팅 상담"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => router.push(`/chat/${appt.id}`)}
              />
              <Button
                label="일정 변경"
                variant="secondary"
                style={{ flex: 1 }}
                // 변경 = 담당의의 예약 가능 시간에서 새 슬롯 선택(예약 플로우 재사용)
                onPress={() => router.push(`/doctor/${appt.id}?reschedule=1`)}
              />
            </View>
            {isDoctor ? (
              <Button
                label="문서 발급 (처방전·진료내역서)"
                variant="secondary"
                full
                onPress={() => router.push(`/prescribe/${appt.id}`)}
              />
            ) : null}
            <Button label="예약 취소" variant="ghost" full onPress={cancel} />
          </View>
        ) : (
          <View style={{ marginTop: spacing.x6, gap: spacing.x2 }}>
            {isDoctor ? (
              <Button
                label="문서 발급 (처방전·진료내역서)"
                full
                onPress={() => router.push(`/prescribe/${appt.id}`)}
              />
            ) : null}
            <Button
              label="처방전 · 서류 보기"
              variant={isDoctor ? "secondary" : "primary"}
              full
              onPress={() => router.push("/documents")}
            />
            {!isDoctor ? (
              <Button
                label="진료 후기 남기기"
                variant="secondary"
                full
                onPress={() => router.push(`/review/${appt.id}`)}
              />
            ) : null}
            <Button
              label="다시 예약"
              variant="ghost"
              full
              onPress={() => router.push("/(tabs)/doctors")}
            />
          </View>
        )}
      </Screen>
    </>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name={icon} size={18} color={colors.muted} />
        <Text variant="small" color="muted">
          {label}
        </Text>
      </View>
      <Text variant="body">{value}</Text>
    </View>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.line }} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
