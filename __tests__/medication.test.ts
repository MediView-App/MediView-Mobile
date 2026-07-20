/**
 * 복약 알림 스케줄 계산 검증.
 * 알림 예약은 부작용(로컬 알림)이라 눈으로 확인하기 어렵다 —
 * "몇 건이, 어떤 시각에" 잡히는지가 회귀하기 쉬워 여기서 고정한다.
 */
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { scheduleMedicationReminders, cancelMedicationReminders } from "@/lib/medication";
import type { PrescriptionContent } from "@/api/documents";

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: "date" },
}));

const mocked = Notifications as jest.Mocked<typeof Notifications>;

const rx = (over: Partial<PrescriptionContent> = {}): PrescriptionContent => ({
  drugs: [{ name: "타이레놀", freqPerDay: 3, days: 2 }],
  dispenseDays: 2,
  ...over,
});

beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = "ios";
  (mocked.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true, canAskAgain: false });
  (mocked.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
  (mocked.scheduleNotificationAsync as jest.Mock).mockResolvedValue("id");
  // 자정 기준으로 고정 → 그날의 모든 시각이 미래가 되어 계산이 결정적이 된다.
  jest.useFakeTimers().setSystemTime(new Date("2026-03-02T00:00:00"));
});
afterEach(() => jest.useRealTimers());

it("1일 3회 × 2일이면 6건을 예약한다", async () => {
  const n = await scheduleMedicationReminders("d1", rx());
  expect(n).toBe(6);
  expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(6);
});

it("이미 지난 시각은 건너뛴다", async () => {
  jest.setSystemTime(new Date("2026-03-02T14:00:00")); // 9시·13시는 지남, 20시만 남음
  const n = await scheduleMedicationReminders("d1", rx({ dispenseDays: 1 }));
  expect(n).toBe(1);
});

it("권한이 없으면 아무 것도 예약하지 않는다", async () => {
  (mocked.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false, canAskAgain: true });
  (mocked.requestPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
  const n = await scheduleMedicationReminders("d1", rx());
  expect(n).toBe(0);
  expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
});

it("약품이 없으면 예약하지 않는다", async () => {
  const n = await scheduleMedicationReminders("d1", { drugs: [] });
  expect(n).toBe(0);
});

it("투약일수는 14일로 상한을 둔다(무한 예약 방지)", async () => {
  const n = await scheduleMedicationReminders(
    "d1",
    { drugs: [{ name: "약", freqPerDay: 1, days: 999 }], dispenseDays: 999 },
  );
  expect(n).toBe(14); // 1일 1회 × 14일
});

it("웹에서는 no-op", async () => {
  Platform.OS = "web";
  expect(await scheduleMedicationReminders("d1", rx())).toBe(0);
  expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
});

it("취소는 해당 문서의 알림만 지운다", async () => {
  (mocked.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
    { identifier: "a", content: { data: { tag: "medication", documentId: "d1" } } },
    { identifier: "b", content: { data: { tag: "medication", documentId: "d2" } } },
    { identifier: "c", content: { data: { tag: "other", documentId: "d1" } } },
  ]);
  await cancelMedicationReminders("d1");
  expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
  expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledWith("a");
});
