import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";

/**
 * WebSocket 접속용 단명 티켓 발급. (백엔드: POST /api/ws/ticket)
 * 쿼리스트링에 JWT 를 노출하지 않기 위해 티켓을 사용한다.
 */
export async function getWsTicket(): Promise<string | null> {
  if (DEMO_MODE) return null;
  try {
    const res = await api<{ ticket: string }>("/api/ws/ticket", { method: "POST" });
    return res?.ticket ?? null;
  } catch {
    return null;
  }
}
