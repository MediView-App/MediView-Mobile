import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { useTheme } from "@/theme/theme";

const CONTENT: Record<string, { title: string; body: string[] }> = {
  terms: {
    title: "이용약관",
    body: [
      "제1조 (목적) 본 약관은 MediView(이하 '회사')가 제공하는 비대면 진료 중개 서비스의 이용 조건과 절차, 회사와 이용자의 권리·의무를 규정합니다.",
      "제2조 (서비스) 회사는 이용자와 의료기관/의료인을 연결하고, 예약·상담·처방 전달·결제 등의 부가 기능을 제공합니다. 진료 및 처방의 의학적 판단은 담당 의료인의 책임입니다.",
      "제3조 (이용자의 의무) 이용자는 정확한 정보를 제공하고, 본인확인 절차에 협조하며, 서비스를 관련 법령이 허용하는 범위에서 이용해야 합니다.",
      "제4조 (결제·환불) 진료비 결제 및 환불은 관련 법령과 회사의 정책에 따릅니다.",
      "제5조 (책임의 제한) 회사는 중개자로서, 의료행위의 결과에 대해 관련 법령이 정한 범위에서 책임을 부담합니다.",
    ],
  },
  privacy: {
    title: "개인정보처리방침",
    body: [
      "1. 수집 항목: 이름, 연락처, 이메일, 본인확인 정보(CI/DI), 진료·문진 내용, 결제 정보.",
      "2. 수집 목적: 비대면 진료 중개, 본인확인, 결제 및 환불, 서비스 개선, 법령상 의무 이행.",
      "3. 보관 및 보호: 진료기록·문진 등 민감정보는 저장 시 암호화(AES-256)되며, 접근은 권한이 있는 자로 제한되고 모든 접근이 감사 로그로 기록됩니다.",
      "4. 제3자 제공: 진료를 위한 의료기관/의료인 제공 외에는 법령에 근거하지 않는 한 제공하지 않습니다.",
      "5. 이용자 권리: 이용자는 자신의 개인정보 열람·정정·삭제·처리정지를 요청할 수 있습니다.",
    ],
  },
  sensitive: {
    title: "민감정보 처리 동의",
    body: [
      "회사는 비대면 진료 제공을 위해 「개인정보 보호법」 제23조에 따른 민감정보(건강에 관한 정보 등)를 별도 동의를 받아 처리합니다.",
      "1. 처리 항목: 증상·문진 답변, 진단·처방 내용, 진료기록, 약물 정보 등 건강 관련 정보.",
      "2. 처리 목적: 담당 의료인의 진료·처방, 처방전 전달 및 조제 연계.",
      "3. 보유·이용 기간: 관련 법령이 정한 진료기록 보존 기간에 따르며, 기간 경과 시 지체 없이 파기합니다.",
      "4. 동의 거부 권리: 이용자는 동의를 거부할 수 있으나, 이 경우 비대면 진료 서비스 이용이 제한됩니다.",
    ],
  },
  telemedicine: {
    title: "비대면 진료 특성·한계 고지",
    body: [
      "비대면 진료는 대면 진료를 완전히 대체하지 않습니다. 시진·촉진·검사 등이 제한되어 진단·처방에 한계가 있을 수 있습니다.",
      "담당 의료인의 판단에 따라 대면 진료가 권고되거나 진료·처방이 제한될 수 있습니다.",
      "응급 증상(의식 저하, 심한 흉통·호흡곤란, 마비, 심한 출혈 등)에는 비대면 진료가 적합하지 않으며, 즉시 119 또는 응급실 이용이 필요합니다.",
      "마약류 등 오남용 우려 의약품은 관련 법령에 따라 비대면 처방이 제한될 수 있습니다.",
      "비대면 진료 및 처방 전달의 가능 범위는 관련 법령·고시에 따르며, 정책 변경 시 서비스 내용이 달라질 수 있습니다.",
    ],
  },
};

export default function Legal() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { colors, spacing } = useTheme();
  const doc = CONTENT[String(type)] ?? CONTENT.terms;

  return (
    <>
      <Header title={doc.title} />
      <Screen>
        {/* 검수 필요 안내 배너 */}
        <Card
          style={{
            flexDirection: "row",
            gap: 8,
            backgroundColor: colors.surface2,
            marginBottom: spacing.x4,
          }}
        >
          <Ionicons name="information-circle-outline" size={18} color={colors.muted} />
          <Text variant="caption" color="muted" style={{ flex: 1, lineHeight: 18 }}>
            표시된 문구는 서비스 이해를 돕기 위한 예시이며, 실제 시행 전 법무·규제 검토를
            거친 확정본으로 대체되어야 합니다.
          </Text>
        </Card>

        {doc.body.map((p, i) => (
          <Text
            key={i}
            variant="small"
            color="muted"
            style={{ lineHeight: 23, marginBottom: spacing.x4 }}
          >
            {p}
          </Text>
        ))}
      </Screen>
    </>
  );
}
