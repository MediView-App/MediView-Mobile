import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/config";
import type { NotificationDto } from "@/lib/types";
import { notifications as mockNotifications, type Notification, type NotiType } from "@/lib/mock";

/** 백엔드 NotificationType → 앱 표시 타입(아이콘 매핑용) */
function toNotiType(dto: NotificationDto): NotiType {
  const t = (dto.title + " " + (dto.content ?? "")).toLowerCase();
  if (t.includes("결제") || t.includes("payment")) return "payment";
  if (t.includes("처방") || t.includes("서류") || t.includes("document")) return "document";
  if (t.includes("예약") || t.includes("진료")) return "appointment";
  return "system";
}

function toView(dto: NotificationDto): Notification {
  return {
    id: String(dto.id),
    type: toNotiType(dto),
    title: dto.title,
    body: dto.content ?? "",
    time: dto.createdAt
      ? new Date(dto.createdAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
      : "",
    read: dto.isRead,
  };
}

/** Expo 푸시 토큰을 서버에 등록한다. */
export async function registerPushToken(token: string, platform: string): Promise<void> {
  if (DEMO_MODE) return;
  try {
    await api<void>("/api/notifications/push-token", {
      method: "POST",
      body: { token, platform },
    });
  } catch {
    // 등록 실패는 조용히 무시(푸시 없이도 앱은 동작)
  }
}

export async function listNotifications(): Promise<Notification[]> {
  if (DEMO_MODE) return mockNotifications;
  // 실서버 모드: 오류 전파(호출부의 useAsync 가 error 상태 처리).
  const list = await api<NotificationDto[]>("/api/notifications");
  return list.map(toView);
}

/**
 * 읽지 않은 알림 개수. 홈 배지에 사용한다.
 * 별도 count 엔드포인트가 없어 목록에서 파생하되, 실패는 조용히 0 으로 둔다
 * (배지는 부가 정보이므로 홈 전체를 error 로 만들지 않는다).
 */
export async function unreadCount(): Promise<number> {
  if (DEMO_MODE) return mockNotifications.filter((n) => !n.read).length;
  try {
    const list = await api<NotificationDto[]>("/api/notifications");
    return list.map(toView).filter((n) => !n.read).length;
  } catch {
    return 0;
  }
}

export async function markAsRead(id: string): Promise<void> {
  if (DEMO_MODE) return;
  try {
    await api<unknown>(`/api/notifications/${id}/read`, { method: "PUT" });
  } catch {
    // 무시(다음 조회에서 정합)
  }
}
