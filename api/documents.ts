import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";
import { documents as mockDocs, type MedDocument, type DocType } from "@/lib/mock";

/** 백엔드 MyDocumentResponse */
type MyDoc = {
  id: number;
  type: "SUMMARY" | "CONFIRMATION" | "OPINION" | "PRESCRIPTION" | "MEDICAL_RECORD";
  status: "DRAFT" | "APPROVED" | "ISSUED";
  doctorName?: string;
  organizationName?: string;
  issuedAt?: string;
};

const typeMap: Record<MyDoc["type"], DocType> = {
  SUMMARY: "CONFIRMATION",
  CONFIRMATION: "CONFIRMATION",
  OPINION: "OPINION",
  PRESCRIPTION: "PRESCRIPTION",
  MEDICAL_RECORD: "CONFIRMATION",
};
const titleMap: Record<MyDoc["type"], string> = {
  SUMMARY: "방문요약",
  CONFIRMATION: "진료확인서",
  OPINION: "소견서",
  PRESCRIPTION: "처방전",
  MEDICAL_RECORD: "진료내역서",
};

function toDoc(d: MyDoc): MedDocument {
  return {
    id: String(d.id),
    type: typeMap[d.type] ?? "CONFIRMATION",
    title: titleMap[d.type] ?? "서류",
    doctor: d.doctorName ?? "",
    org: d.organizationName ?? "",
    issuedAt: d.issuedAt
      ? new Date(d.issuedAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
      : "",
    status: d.status === "ISSUED" ? "ISSUED" : "DRAFT",
  };
}

export async function listDocuments(): Promise<MedDocument[]> {
  if (DEMO_MODE) return mockDocs;
  try {
    const list = await api<MyDoc[]>("/api/documents");
    return list.map(toDoc);
  } catch {
    return mockDocs;
  }
}

export async function getDocument(id: string): Promise<MedDocument | null> {
  if (DEMO_MODE) return mockDocs.find((d) => d.id === id) ?? null;
  try {
    const list = await api<MyDoc[]>("/api/documents");
    return list.map(toDoc).find((d) => d.id === id) ?? null;
  } catch {
    return mockDocs.find((d) => d.id === id) ?? null;
  }
}

/** 처방전 본문 구조(백엔드 서식 JSON). */
export type PrescriptionContent = {
  diagnosis?: string;
  drugs: {
    name: string;
    dose?: string;
    freqPerDay?: number;
    days?: number;
    usage?: string;
  }[];
  dispenseDays?: number;
  notes?: string;
};

/** 진료내역서 본문 구조(백엔드 서식 JSON). */
export type MedicalRecordContent = {
  diagnosis?: string;
  visitDate?: string;
  treatment?: string;
  notes?: string;
};

export type IssueDocType = "PRESCRIPTION" | "MEDICAL_RECORD";

/** 문서 상세(본문 포함). 복약 알림/재처방에 필요한 처방 내용을 얻는다. */
export type DocumentDetail = {
  id: number;
  appointmentId: number;
  type: string;
  prescription: PrescriptionContent | null;
};

export async function getDocumentDetail(id: string | number): Promise<DocumentDetail | null> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 350));
    return {
      id: Number(id) || 1,
      appointmentId: 1,
      type: "PRESCRIPTION",
      prescription: {
        diagnosis: "급성 상기도감염 (J06.9)",
        drugs: [
          { name: "아세트아미노펜정 500mg", dose: "1정", freqPerDay: 3, days: 3, usage: "매 식후 30분" },
          { name: "코대원포르테시럽", dose: "10mL", freqPerDay: 3, days: 3, usage: "매 식후" },
        ],
        dispenseDays: 3,
        notes: "충분한 수분 섭취",
      },
    };
  }
  try {
    const d = await api<{ id: number; appointmentId: number; type: string; content?: string }>(
      `/api/documents/${id}/download`,
    );
    let prescription: PrescriptionContent | null = null;
    if (d.content?.trim().startsWith("{")) {
      try {
        prescription = JSON.parse(d.content) as PrescriptionContent;
      } catch {
        prescription = null;
      }
    }
    return { id: d.id, appointmentId: d.appointmentId, type: d.type, prescription };
  } catch {
    return null;
  }
}

/**
 * 의료진이 문서를 발급한다: DRAFT 생성(POST) → 승인(approve)으로 ISSUED 전환.
 * content 는 서식 JSON 을 문자열로 저장한다.
 */
export async function issueDocument(
  appointmentId: string | number,
  type: IssueDocType,
  content: PrescriptionContent | MedicalRecordContent,
): Promise<{ id: number }> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    return { id: 1 };
  }
  const created = await api<{ id: number }>("/api/documents", {
    method: "POST",
    body: { appointmentId: Number(appointmentId), type, content: JSON.stringify(content) },
  });
  await api(`/api/documents/${created.id}/approve`, { method: "POST" });
  return { id: created.id };
}
