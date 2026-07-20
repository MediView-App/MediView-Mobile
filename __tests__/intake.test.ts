/**
 * 문진 structuredJson 파싱 — 서버가 준 문자열을 그대로 신뢰하면 안 되는 지점.
 * (깨진 JSON/누락 필드에도 화면이 죽지 않아야 한다)
 */
import { parseIntakeMeta, type IntakeForm } from "@/api/intake";

const form = (structuredJson?: string): IntakeForm => ({
  id: 1,
  appointmentId: 1,
  structuredJson,
});

it("정상 JSON 에서 기간·기저질환을 뽑는다", () => {
  const r = parseIntakeMeta(form(JSON.stringify({ duration: "2~3일", conditions: ["고혈압", "당뇨"] })));
  expect(r.duration).toBe("2~3일");
  expect(r.conditions).toEqual(["고혈압", "당뇨"]);
});

it("깨진 JSON 이어도 죽지 않고 빈 값을 준다", () => {
  const r = parseIntakeMeta(form("{not json"));
  expect(r.conditions).toEqual([]);
  expect(r.duration).toBeUndefined();
});

it("conditions 가 배열이 아니면 빈 배열로 방어한다", () => {
  const r = parseIntakeMeta(form(JSON.stringify({ conditions: "고혈압" })));
  expect(r.conditions).toEqual([]);
});

it("문진이 없으면 빈 값", () => {
  expect(parseIntakeMeta(null).conditions).toEqual([]);
  expect(parseIntakeMeta(form(undefined)).conditions).toEqual([]);
});
