import { useEffect, useState } from "react";
import { View, Pressable, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Text } from "@/components/Text";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Skeleton } from "@/components/Skeleton";
import { useTheme } from "@/theme/theme";
import { palette } from "@/theme/tokens";
import {
  issueDocument,
  type IssueDocType,
  type PrescriptionContent,
} from "@/api/documents";
import { getIntake, parseIntakeMeta, type IntakeForm } from "@/api/intake";

type DrugRow = { name: string; dose: string; freqPerDay: string; days: string; usage: string };

const emptyDrug: DrugRow = { name: "", dose: "", freqPerDay: "", days: "", usage: "" };
const today = new Date().toISOString().slice(0, 10);

// 비대면 처방이 제한될 수 있는 성분(예시). 실제 목록은 식약처·복지부 고시 기준으로 관리해야 함.
const RESTRICTED_KEYWORDS = [
  "졸피뎀", "zolpidem",
  "디아제팜", "diazepam",
  "알프라졸람", "alprazolam",
  "펜타닐", "fentanyl",
  "옥시코돈", "oxycodone",
  "프로포폴", "propofol",
  "펜터민", "phentermine",
  "메칠페니데이트", "메틸페니데이트", "methylphenidate",
];

/** 트리아지 배지 — JellySafe 틴트 레시피(색만 쓰지 않고 라벨 병기). */
function TriagePill({ level }: { level: string }) {
  const map: Record<string, { label: string; bg: string; fg: string }> = {
    HIGH: { label: "응급의심", bg: "#FDECEE", fg: "#DE122A" },
    MEDIUM: { label: "주의", bg: "#FFF8DB", fg: "#9E7E00" },
    LOW: { label: "경증", bg: "#EAF6F0", fg: "#228756" },
  };
  const c = map[level];
  if (!c) return null;
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text variant="caption" style={{ color: c.fg, fontWeight: "700", fontSize: 10 }}>
        {c.label}
      </Text>
    </View>
  );
}

function restrictedHits(drugs: DrugRow[]): string[] {
  return drugs
    .map((d) => d.name.trim())
    .filter((name) =>
      name && RESTRICTED_KEYWORDS.some((k) => name.toLowerCase().includes(k.toLowerCase())),
    );
}

export default function Prescribe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();

  const [type, setType] = useState<IssueDocType>("PRESCRIPTION");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  // 처방전
  const [drugs, setDrugs] = useState<DrugRow[]>([{ ...emptyDrug }]);
  const [dispenseDays, setDispenseDays] = useState("");

  // 진료내역서
  const [visitDate, setVisitDate] = useState(today);
  const [treatment, setTreatment] = useState("");

  const [loading, setLoading] = useState(false);

  // 사전 문진 — 담당의에게 진료 맥락을 보여주고, 초안 채우기의 원천이 된다.
  const [intake, setIntake] = useState<IntakeForm | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    getIntake(String(id))
      .then((f) => alive && setIntake(f))
      .catch(() => alive && setIntake(null));
    return () => {
      alive = false;
    };
  }, [id]);

  /**
   * 문진 기반 초안 채우기.
   * ⚠️ 진단명은 자동으로 넣지 않는다 — 진단은 의료인의 판단 영역.
   *    환자 진술 요약만 "진료 내용/비고"에 채워 타이핑을 줄인다.
   */
  const fillDraft = () => {
    if (!intake) return;
    const meta = parseIntakeMeta(intake);
    const stated = intake.rawText?.trim();
    const summary = intake.aiSummary?.trim();

    if (type === "MEDICAL_RECORD") {
      setTreatment((prev) => prev || (stated ? `환자 진술: ${stated}` : summary ?? ""));
      setNotes((prev) => prev || (meta.conditions.length ? `기저/특이사항: ${meta.conditions.join(", ")}` : ""));
    } else {
      setNotes((prev) => prev || (summary ?? stated ?? ""));
    }
  };

  const setDrug = (i: number, key: keyof DrugRow) => (v: string) =>
    setDrugs((rows) => rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  const addDrug = () => setDrugs((rows) => [...rows, { ...emptyDrug }]);
  const removeDrug = (i: number) =>
    setDrugs((rows) => (rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows));

  const submit = async () => {
    if (type === "PRESCRIPTION" && !drugs.some((d) => d.name.trim())) {
      Alert.alert("입력 확인", "약품을 하나 이상 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      const content =
        type === "PRESCRIPTION"
          ? ({
              diagnosis: diagnosis.trim() || undefined,
              drugs: drugs
                .filter((d) => d.name.trim())
                .map((d) => ({
                  name: d.name.trim(),
                  dose: d.dose.trim() || undefined,
                  freqPerDay: d.freqPerDay ? Number(d.freqPerDay) : undefined,
                  days: d.days ? Number(d.days) : undefined,
                  usage: d.usage.trim() || undefined,
                })),
              dispenseDays: dispenseDays ? Number(dispenseDays) : undefined,
              notes: notes.trim() || undefined,
            } satisfies PrescriptionContent)
          : {
              diagnosis: diagnosis.trim() || undefined,
              visitDate: visitDate.trim() || undefined,
              treatment: treatment.trim() || undefined,
              notes: notes.trim() || undefined,
            };

      await issueDocument(String(id), type, content);
      Alert.alert("발급 완료", "문서가 발급되었습니다. 환자가 서류함에서 확인·다운로드할 수 있어요.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("발급 실패", e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header title="문서 발급" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: spacing.x5 }}>
        {/* 문서 종류 토글 */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.surface2,
            borderRadius: radius.md,
            padding: 4,
          }}
        >
          {(
            [
              { key: "PRESCRIPTION", label: "처방전", icon: "medkit-outline" },
              { key: "MEDICAL_RECORD", label: "진료내역서", icon: "document-text-outline" },
            ] as const
          ).map((t) => {
            const on = type === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setType(t.key)}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  gap: 6,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 12,
                  borderRadius: radius.sm,
                  backgroundColor: on ? colors.surface : "transparent",
                }}
              >
                <Ionicons name={t.icon} size={17} color={on ? colors.brand : colors.muted} />
                <Text variant="small" color={on ? "content" : "muted"} style={{ fontWeight: "700" }}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 사전 문진 요약 — 진료 맥락 + 초안 채우기 */}
        {intake === undefined ? (
          <Card style={{ gap: 10 }}>
            <Skeleton width="40%" height={12} />
            <Skeleton width="90%" height={14} />
          </Card>
        ) : intake ? (
          <Card style={{ gap: 10, borderColor: colors.brand, borderWidth: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="sparkles" size={15} color={colors.brand} />
              <Text variant="caption" color="brandInk" style={{ fontWeight: "700" }}>
                사전 문진 요약
              </Text>
              {intake.triage ? <TriagePill level={intake.triage} /> : null}
            </View>
            <Text variant="small" color="muted" style={{ lineHeight: 20 }}>
              {intake.rawText || intake.aiSummary || "문진 내용이 없습니다."}
            </Text>
            <Button label="이 내용으로 초안 채우기" variant="secondary" onPress={fillDraft} />
            <Text variant="caption" color="subtle" style={{ lineHeight: 17 }}>
              환자 진술 요약만 채웁니다. 진단·처방은 의료인이 최종 판단합니다.
            </Text>
          </Card>
        ) : (
          <Card>
            <Text variant="small" color="subtle">
              제출된 사전 문진이 없습니다.
            </Text>
          </Card>
        )}

        <Input label="진단명" placeholder="예) 급성 상기도감염 (J06.9)" value={diagnosis} onChangeText={setDiagnosis} />

        {type === "PRESCRIPTION" ? (
          <>
            {restrictedHits(drugs).length > 0 ? (
              <Card style={{ gap: 8, borderColor: palette.warning, borderWidth: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="warning-outline" size={18} color={palette.warning} />
                  <Text variant="bodyStrong">비대면 처방 제한 주의</Text>
                </View>
                <Text variant="caption" color="muted" style={{ lineHeight: 18 }}>
                  {restrictedHits(drugs).join(", ")} — 마약류·오남용 우려 의약품은 관련
                  법령·고시에 따라 비대면 처방이 제한될 수 있습니다. 처방 가능 여부를 확인하세요.
                </Text>
              </Card>
            ) : null}
            <View style={{ gap: spacing.x3 }}>
              <Text variant="bodyStrong">처방 의약품</Text>
              {drugs.map((d, i) => (
                <Card key={i} style={{ gap: spacing.x3 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text variant="small" color="muted">
                      약품 {i + 1}
                    </Text>
                    {drugs.length > 1 ? (
                      <Pressable onPress={() => removeDrug(i)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={18} color={palette.danger} />
                      </Pressable>
                    ) : null}
                  </View>
                  <Input label="약품명" placeholder="아세트아미노펜정 500mg" value={d.name} onChangeText={setDrug(i, "name")} />
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Input label="1회 투약량" placeholder="1정" value={d.dose} onChangeText={setDrug(i, "dose")} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Input
                        label="1일 횟수"
                        placeholder="3"
                        keyboardType="number-pad"
                        value={d.freqPerDay}
                        onChangeText={setDrug(i, "freqPerDay")}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Input
                        label="투약일수"
                        placeholder="5"
                        keyboardType="number-pad"
                        value={d.days}
                        onChangeText={setDrug(i, "days")}
                      />
                    </View>
                  </View>
                  <Input label="용법" placeholder="매 식후 30분" value={d.usage} onChangeText={setDrug(i, "usage")} />
                </Card>
              ))}
              <Button label="+ 약품 추가" variant="secondary" onPress={addDrug} />
            </View>
            <Input
              label="총 조제일수"
              placeholder="5"
              keyboardType="number-pad"
              value={dispenseDays}
              onChangeText={setDispenseDays}
            />
            <Input label="복약 안내" placeholder="충분한 수분을 섭취하세요." value={notes} onChangeText={setNotes} />
          </>
        ) : (
          <>
            <Input label="진료일" placeholder="2026-07-06" value={visitDate} onChangeText={setVisitDate} />
            <Input
              label="진료 내용"
              placeholder="약물치료 및 경과관찰"
              value={treatment}
              onChangeText={setTreatment}
              multiline
              style={{ minHeight: 88, textAlignVertical: "top" }}
            />
            <Input label="비고" placeholder="3일 후 증상 지속 시 재진 권고" value={notes} onChangeText={setNotes} />
          </>
        )}

        <Button label={loading ? "발급 중…" : "발급하기"} full onPress={submit} style={{ marginTop: spacing.x2 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
