/**
 * 예약 슬롯 생성 · 서버 전송 포맷 검증.
 * 서버가 과거 시각을 거부하므로 "지금 이후"만 만들어야 하고,
 * LocalDateTime 문자열이 어긋나면 변경이 통째로 실패한다.
 */
import { generateSlots, toLocalDateTimeString } from "@/lib/slots";

it("모든 슬롯은 현재 시각보다 미래다", () => {
  const now = new Date("2026-03-02T10:20:00");
  const slots = generateSlots(now, 20);
  expect(slots.length).toBeGreaterThan(0);
  for (const s of slots) {
    expect(s.date.getTime()).toBeGreaterThan(now.getTime());
  }
});

it("오늘 슬롯이 내일보다 먼저 온다", () => {
  const slots = generateSlots(new Date("2026-03-02T09:05:00"), 20);
  const firstTomorrow = slots.findIndex((s) => s.label.startsWith("내일"));
  const lastToday = slots.map((s) => s.label.startsWith("오늘")).lastIndexOf(true);
  if (firstTomorrow >= 0) expect(lastToday).toBeLessThan(firstTomorrow);
});

it("진료 마감 후에는 내일 슬롯만 나온다", () => {
  const slots = generateSlots(new Date("2026-03-02T21:00:00"), 6);
  expect(slots.every((s) => s.label.startsWith("내일"))).toBe(true);
});

it("limit 을 넘지 않는다", () => {
  expect(generateSlots(new Date("2026-03-02T09:00:00"), 5)).toHaveLength(5);
});

it("LocalDateTime 문자열은 타임존 없이 로컬 시각 그대로", () => {
  const d = new Date(2026, 2, 2, 9, 5, 0); // 2026-03-02 09:05 로컬
  expect(toLocalDateTimeString(d)).toBe("2026-03-02T09:05:00");
});

it("월·일·시가 한 자리여도 0 을 채운다", () => {
  const d = new Date(2026, 0, 5, 8, 0, 0);
  expect(toLocalDateTimeString(d)).toBe("2026-01-05T08:00:00");
});
