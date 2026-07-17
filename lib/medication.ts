import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { PrescriptionContent } from "@/api/documents";

/**
 * 복약 알림 — 처방전의 용법(1일 횟수 × 투약일수)으로 기기 로컬 알림을 예약한다.
 * 서버 없이 동작하며, 취소/재예약은 문서 단위 태그로 관리한다.
 */

/** 1일 n회 → 기본 복용 시각(시). 3회=아침/점심/저녁 식후 기준. */
function timesFor(freqPerDay: number): number[] {
  switch (Math.max(1, Math.min(4, freqPerDay))) {
    case 1:
      return [9];
    case 2:
      return [9, 20];
    case 3:
      return [9, 13, 20];
    default:
      return [8, 12, 17, 21];
  }
}

const TAG = "medication";

/** 해당 문서의 기존 복약 알림을 모두 취소. */
export async function cancelMedicationReminders(documentId: string): Promise<void> {
  if (Platform.OS === "web") return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => {
        const d = n.content.data as { tag?: string; documentId?: string } | undefined;
        return d?.tag === TAG && d?.documentId === documentId;
      })
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/**
 * 처방 내용으로 복약 알림 예약. 이미 예약된 같은 문서 알림은 먼저 정리한다.
 * @returns 예약된 알림 개수
 */
export async function scheduleMedicationReminders(
  documentId: string,
  content: PrescriptionContent,
): Promise<number> {
  if (Platform.OS === "web") return 0;

  const perm = await Notifications.getPermissionsAsync();
  let granted = perm.granted;
  if (!granted && perm.canAskAgain) {
    granted = (await Notifications.requestPermissionsAsync()).granted;
  }
  if (!granted) return 0;

  await cancelMedicationReminders(documentId);

  const drugs = (content.drugs ?? []).filter((d) => d.name?.trim());
  if (!drugs.length) return 0;

  // 약품별 최대 투약일수만큼, 하루 n회 시각에 예약.
  const days = Math.max(1, Math.min(14, content.dispenseDays ?? Math.max(...drugs.map((d) => d.days ?? 1))));
  const freq = Math.max(1, Math.max(...drugs.map((d) => d.freqPerDay ?? 1)));
  const hours = timesFor(freq);
  const names = drugs.map((d) => d.name).join(", ");

  let count = 0;
  const now = new Date();
  for (let day = 0; day < days; day++) {
    for (const hour of hours) {
      const when = new Date(now);
      when.setDate(now.getDate() + day);
      when.setHours(hour, 0, 0, 0);
      if (when <= now) continue; // 지난 시각은 건너뜀

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "복약 시간이에요 💊",
          body: `${names} 복용할 시간입니다.`,
          data: { tag: TAG, documentId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: when,
        },
      });
      count++;
    }
  }
  return count;
}

/** 해당 문서로 예약된 복약 알림 개수. */
export async function countMedicationReminders(documentId: string): Promise<number> {
  if (Platform.OS === "web") return 0;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.filter((n) => {
    const d = n.content.data as { tag?: string; documentId?: string } | undefined;
    return d?.tag === TAG && d?.documentId === documentId;
  }).length;
}
