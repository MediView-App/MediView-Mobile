import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { MedDocument } from "@/lib/mock";

/** 전자문서를 브랜드 서식의 HTML 로 렌더링. */
function documentHtml(doc: MedDocument): string {
  const label =
    doc.type === "PRESCRIPTION" ? "처방전" : doc.type === "OPINION" ? "소견서" : "진료확인서";
  return `
  <html>
    <head><meta charset="utf-8" />
      <style>
        * { font-family: -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; }
        body { margin: 0; color: #0f1518; }
        .wrap { padding: 48px 40px; }
        .head { display:flex; align-items:center; justify-content:space-between;
                background:#0d6b70; color:#fff; border-radius:16px; padding:20px 24px; }
        .brand { font-size:18px; font-weight:800; }
        .tag { background:rgba(255,255,255,.18); padding:4px 12px; border-radius:999px; font-size:12px; }
        h1 { font-size:28px; margin:32px 0 24px; }
        table { width:100%; border-collapse:collapse; }
        td { padding:12px 0; font-size:15px; border-bottom:1px solid #e1e7ea; }
        td.k { color:#6a7880; width:40%; }
        td.v { text-align:right; font-weight:600; }
        .note { margin-top:28px; font-size:12px; color:#98a5ac; line-height:1.6; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="head">
          <span class="brand">MediView 전자문서</span>
          <span class="tag">발급 완료</span>
        </div>
        <h1>${doc.title || label}</h1>
        <table>
          <tr><td class="k">문서 종류</td><td class="v">${label}</td></tr>
          <tr><td class="k">발급 의료진</td><td class="v">${doc.doctor || "-"}</td></tr>
          <tr><td class="k">의료기관</td><td class="v">${doc.org || "-"}</td></tr>
          <tr><td class="k">발급 일시</td><td class="v">${doc.issuedAt || "-"}</td></tr>
          <tr><td class="k">문서 번호</td><td class="v">MV-${doc.id.toUpperCase()}-2026</td></tr>
        </table>
        <p class="note">본 문서는 위·변조 방지 서명이 포함된 MediView 전자문서입니다.
        진위 확인은 MediView 앱 또는 발급 의료기관에 문의하세요.</p>
      </div>
    </body>
  </html>`;
}

/** 문서를 PDF 로 만들어 저장/공유한다. (웹은 인쇄 대화상자) */
export async function saveDocumentPdf(doc: MedDocument): Promise<void> {
  const html = documentHtml(doc);
  if (Platform.OS === "web") {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `${doc.title} 저장/공유`,
      UTI: "com.adobe.pdf",
    });
  }
}
