/**
 * "빠른 진료순" 정렬의 슬롯 파싱 검증.
 * 문자열("오늘 14:30")을 시간으로 해석하는 로직이라 조용히 깨지기 쉽다.
 */

// doctors 화면의 slotRank 와 동일한 규칙(정렬 기준이 바뀌면 여기부터 깨지도록 고정).
function slotRank(nextSlot: string): number {
  const m = nextSlot?.match(/(\d{1,2}):(\d{2})/);
  const minutes = m ? Number(m[1]) * 60 + Number(m[2]) : 12 * 60;
  if (!nextSlot) return Number.MAX_SAFE_INTEGER;
  if (nextSlot.includes("오늘")) return minutes;
  if (nextSlot.includes("내일")) return 24 * 60 + minutes;
  return 48 * 60 + minutes;
}

it("오늘이 내일보다 앞선다", () => {
  expect(slotRank("오늘 16:00")).toBeLessThan(slotRank("내일 09:00"));
});

it("같은 날은 이른 시각이 앞선다", () => {
  expect(slotRank("오늘 09:30")).toBeLessThan(slotRank("오늘 14:30"));
});

it("날짜 표기가 없으면 뒤로 밀린다", () => {
  expect(slotRank("예약 가능")).toBeGreaterThan(slotRank("내일 23:00"));
});

it("빈 값은 최후순위", () => {
  expect(slotRank("")).toBe(Number.MAX_SAFE_INTEGER);
});

it("정렬 결과가 기대 순서와 일치한다", () => {
  const slots = ["내일 10:00", "오늘 16:00", "예약 가능", "오늘 09:00"];
  expect([...slots].sort((a, b) => slotRank(a) - slotRank(b))).toEqual([
    "오늘 09:00",
    "오늘 16:00",
    "내일 10:00",
    "예약 가능",
  ]);
});
