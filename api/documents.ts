import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";
import { documents as mockDocs, type MedDocument, type DocType } from "@/lib/mock";

/** 백엔드 MyDocumentResponse */
type MyDoc = {
  id: number;
  type: "SUMMARY" | "CONFIRMATION" | "OPINION";
  status: "DRAFT" | "APPROVED" | "ISSUED";
  doctorName?: string;
  organizationName?: string;
  issuedAt?: string;
};

const typeMap: Record<MyDoc["type"], DocType> = {
  SUMMARY: "CONFIRMATION",
  CONFIRMATION: "CONFIRMATION",
  OPINION: "OPINION",
};
const titleMap: Record<MyDoc["type"], string> = {
  SUMMARY: "방문요약",
  CONFIRMATION: "진료확인서",
  OPINION: "소견서",
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
