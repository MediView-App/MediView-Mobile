import { useState } from "react";
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
import { statusLabel, type AppointmentStatus } from "@/lib/mock";
import { useAppointment } from "@/lib/useAppointment";
import { cancelAppointment } from "@/api/appointments";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";

export default function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [cancelling, setCancelling] = useState(false);
  const isDoctor = user?.role === "DOCTOR";
  const appt = useAppointment(id);
  const active = appt?.status !== "COMPLETED";

  const cancel = () =>
    Alert.alert("예약 취소", "이 예약을 취소할까요? 되돌릴 수 없습니다.", [
      { text: "닫기", style: "cancel" },
      {
        text: "취소하기",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          try {
            await cancelAppointment(String(id));
            toast.show("예약이 취소되었어요.");
            router.replace("/(tabs)/appointments");
          } catch (e) {
            // 서버가 거부한 사유(진행 중/이미 완료 등)를 그대로 보여준다.
            toast.show(e instanceof Error ? e.message : "예약을 취소하지 못했어요.", "error");
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);

  return (
    <>
      <Header title="예약 상세" />
      <Screen>
        <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Avatar name={appt?.doctorName ?? "의료진"} size={56} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">{appt?.doctorName ?? "담당 의료진"}</Text>
            <Text variant="small" color="muted">
              {appt?.specialty || appt?.organizationName || "비대면 진료"}
            </Text>
          </View>
          <Badge tone={active ? "brand" : "neutral"} label={statusLabel[(appt?.status ?? "SCHEDULED") as AppointmentStatus] ?? "예약됨"} />
        </Card>

        <Card style={{ marginTop: spacing.x4, gap: spacing.x3 }}>
          <Row icon="calendar-outline" label="일시" value={appt?.when ?? "-"} />
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
              onPress={() => router.push(isDoctor ? "/consult/1" : `/waiting/${id}`)}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button
                label="채팅 상담"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => router.push(`/chat/${id}`)}
              />
              <Button
                label="일정 변경"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => router.push(`/reschedule/${id}`)}
              />
            </View>
            {isDoctor ? (
              <Button
                label="문서 발급 (처방전·진료내역서)"
                variant="secondary"
                full
                onPress={() => router.push(`/prescribe/${id}`)}
              />
            ) : null}
            <Button
              label={cancelling ? "취소 중…" : "예약 취소"}
              variant="ghost"
              full
              disabled={cancelling}
              onPress={cancel}
            />
          </View>
        ) : (
          <View style={{ marginTop: spacing.x6, gap: spacing.x2 }}>
            {isDoctor ? (
              <Button
                label="문서 발급 (처방전·진료내역서)"
                full
                onPress={() => router.push(`/prescribe/${id}`)}
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
                onPress={() => router.push(`/review/${id}`)}
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
