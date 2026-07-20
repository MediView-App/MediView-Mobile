/**
 * 예약 가능 시간 슬롯 생성.
 * 하드코딩 문자열("오늘 14:30") 대신 실제 Date 를 만들어 서버로 정확한 시각을 보낸다.
 * (서버는 과거 시각을 거부하므로 "지금 이후"만 생성한다)
 */

export type Slot = { label: string; date: Date };

const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;
const STEP_MIN = 30;

function fmt(d: Date, dayLabel: string): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${dayLabel} ${hh}:${mm}`;
}

/** 해당 날짜의 진료 시간대 슬롯. after 이후만 포함. */
function slotsForDay(base: Date, dayLabel: string, after: Date): Slot[] {
  const out: Slot[] = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    for (let m = 0; m < 60; m += STEP_MIN) {
      const d = new Date(base);
      d.setHours(h, m, 0, 0);
      if (d.getTime() <= after.getTime()) continue;
      out.push({ label: fmt(d, dayLabel), date: d });
    }
  }
  return out;
}

/**
 * 오늘 남은 슬롯 + 내일 슬롯을 합쳐 반환.
 * @param now 기준 시각(테스트에서 주입)
 * @param limit 최대 개수
 */
export function generateSlots(now: Date = new Date(), limit = 8): Slot[] {
  const today = slotsForDay(now, "오늘", now);
  const tomorrowBase = new Date(now);
  tomorrowBase.setDate(now.getDate() + 1);
  // 내일은 하루 전체가 미래이므로 기준을 자정으로 둔다.
  const midnight = new Date(tomorrowBase);
  midnight.setHours(0, 0, 0, 0);
  const tomorrow = slotsForDay(tomorrowBase, "내일", midnight);

  return [...today, ...tomorrow].slice(0, limit);
}

/** 백엔드가 기대하는 LocalDateTime 문자열(타임존 표기 없이). */
export function toLocalDateTimeString(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}
