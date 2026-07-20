import { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import { docTypeLabel, type MedDocument } from "@/lib/mock";
import { getDocument, getDocumentDetail, type DocumentDetail } from "@/api/documents";
import { saveDocumentPdf, downloadServerDocumentPdf } from "@/lib/pdf";
import { DEMO_MODE } from "@/lib/config";
import { scheduleMedicationReminders, cancelMedicationReminders, countMedicationReminders } from "@/lib/medication";
import { requestRefill } from "@/api/refill";
import { useToast } from "@/components/Toast";

export default function DocumentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [doc, setDoc] = useState<MedDocument | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [reminders, setReminders] = useState(0);
  const [busy, setBusy] = useState(false);

  const isPrescription = doc?.type === "PRESCRIPTION";

  // 처방전이면 본문(약품·용법)과 예약된 복약 알림 개수를 가져온다.
  useEffect(() => {
    if (!isPrescription) return;
    let alive = true;
    getDocumentDetail(String(id)).then((d) => alive && setDetail(d));
    countMedicationReminders(String(id)).then((n) => alive && setReminders(n));
    return () => {
      alive = false;
    };
  }, [id, isPrescription]);

  const toggleReminders = async () => {
    if (!detail?.prescription) {
      Alert.alert("복약 알림", "처방 내용을 불러오지 못했어요.");
      return;
    }
    setBusy(true);
    try {
      if (reminders > 0) {
        await cancelMedicationReminders(String(id));
        setReminders(0);
        toast.show("복약 알림을 껐어요.", "info");
      } else {
        const n = await scheduleMedicationReminders(String(id), detail.prescription);
        setReminders(n);
        toast.show(
          n > 0
            ? `${n}건의 복약 알림을 예약했어요.`
            : "알림 권한이 없거나 예약할 시간이 없어요.",
          n > 0 ? "success" : "info",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const onRefill = async () => {
    Alert.alert("재처방 요청", "같은 의료진에게 재처방 진료를 요청할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "요청하기",
        onPress: async () => {
          setBusy(true);
          try {
            await requestRefill(String(id));
            toast.show("재처방 진료가 접수되었어요. 의료진 확인 후 진행됩니다.");
            router.replace("/(tabs)/appointments");
          } catch (e) {
            Alert.alert("요청 실패", e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const onSave = async () => {
    if (!doc) return;
    setSaving(true);
    try {
      // 데모/오프라인은 클라이언트 렌더링, 실서버는 서식 기반 정식 PDF 를 내려받는다.
      if (DEMO_MODE) {
        await saveDocumentPdf(doc);
      } else {
        const fileName = `MediView_${doc.type.toLowerCase()}_${doc.id}.pdf`;
        await downloadServerDocumentPdf(doc.id, fileName);
      }
    } catch (e) {
      Alert.alert(
        "저장 실패",
        e instanceof Error ? e.message : "문서를 저장하지 못했어요. 다시 시도해 주세요.",
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let alive = true;
    getDocument(String(id))
      .then((d) => alive && setDoc(d))
      .catch(() => alive && setDoc(null));
    return () => {
      alive = false;
    };
  }, [id]);

  if (doc === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, justifyContent: "center" }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!doc) {
    return (
      <>
        <Header title="서류" />
        <Screen>
          <Text variant="body" color="muted">
            서류를 찾을 수 없습니다.
          </Text>
        </Screen>
      </>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <Header title={docTypeLabel[doc.type]} />
      <Screen contentStyle={{ paddingBottom: 120 }}>
        {/* 문서 프리뷰 */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <View style={[styles.docHead, { backgroundColor: palette.primary[700] }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {/* 남색 헤더 위에서는 브랜드 블루가 묻히므로 밝은 톤으로 */}
              <Ionicons name="shield-checkmark" size={18} color={palette.primary[200]} />
              <Text variant="bodyStrong" style={{ color: "#fff" }}>
                MediView 전자문서
              </Text>
            </View>
            <Badge tone="success" label="발급 완료" />
          </View>
          <View style={{ padding: 20, gap: spacing.x4 }}>
            <Text variant="h2">{doc.title}</Text>
            <View style={{ gap: spacing.x3 }}>
              <Row label="발급 의료진" value={`${doc.doctor} 의료진`} />
              <Row label="의료기관" value={doc.org} />
              <Row label="발급 일시" value={doc.issuedAt} />
              <Row label="문서 번호" value={`MV-${doc.id.toUpperCase()}-2026`} />
            </View>
            <View style={{ height: 1, backgroundColor: colors.line }} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="lock-closed" size={15} color={colors.brand} />
              <Text variant="caption" color="muted">
                위·변조 방지 서명이 포함된 전자문서입니다.
              </Text>
            </View>
          </View>
        </Card>

        {/* 처방전 전용: 복약 알림 · 재처방 */}
        {isPrescription ? (
          <>
            <Card style={{ marginTop: spacing.x4, gap: spacing.x3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="alarm-outline" size={18} color={colors.brand} />
                <Text variant="bodyStrong" style={{ flex: 1 }}>
                  복약 알림
                </Text>
                {reminders > 0 ? <Badge tone="brand" label={`${reminders}건 예약됨`} /> : null}
              </View>
              <Text variant="small" color="muted" style={{ lineHeight: 20 }}>
                {detail?.prescription?.drugs?.length
                  ? `${detail.prescription.drugs.map((d) => d.name).join(", ")} · 복용 시간에 맞춰 알려드려요.`
                  : "처방 용법에 맞춰 복용 시간을 알려드려요."}
              </Text>
              <Button
                label={busy ? "처리 중…" : reminders > 0 ? "복약 알림 끄기" : "복약 알림 켜기"}
                variant={reminders > 0 ? "secondary" : "primary"}
                full
                disabled={busy}
                onPress={toggleReminders}
              />
            </Card>

            <Card style={{ marginTop: spacing.x3, gap: spacing.x3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="repeat-outline" size={18} color={colors.brand} />
                <Text variant="bodyStrong" style={{ flex: 1 }}>
                  같은 약이 더 필요하신가요?
                </Text>
              </View>
              <Text variant="small" color="muted" style={{ lineHeight: 20 }}>
                재처방을 요청하면 같은 의료진에게 진료가 접수됩니다. 의료진 확인 후 처방됩니다.
              </Text>
              <Button label="재처방 요청" variant="secondary" full disabled={busy} onPress={onRefill} />
            </Card>
          </>
        ) : null}
      </Screen>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: "row",
          gap: 10,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.line,
        }}
      >
        <Button
          label="약국 전송"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => router.push(`/pharmacy/${doc.id}`)}
        />
        <Button
          label={saving ? "저장 중…" : "PDF 저장"}
          style={{ flex: 1 }}
          onPress={onSave}
        />
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text variant="small" color="muted">
        {label}
      </Text>
      <Text variant="small" color="content" style={{ fontWeight: "600" }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  docHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
