import { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
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
import { getDocument } from "@/api/documents";
import { saveDocumentPdf } from "@/lib/pdf";

export default function DocumentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [doc, setDoc] = useState<MedDocument | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!doc) return;
    setSaving(true);
    try {
      await saveDocumentPdf(doc);
    } catch {
      Alert.alert("저장 실패", "문서를 저장하지 못했어요. 다시 시도해 주세요.");
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
              <Ionicons name="shield-checkmark" size={18} color={palette.accent[400]} />
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
          onPress={() => Alert.alert("약국 전송", "연동된 약국으로 처방전을 전송했어요.")}
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
