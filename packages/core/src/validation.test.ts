import { describe, expect, test } from "vitest";
import {
  assertValidDate,
  assertValidMonth,
  assertValidWeekStart,
  assertValidYear,
  assertValidYearMonth,
  createDate,
  MAX_YEAR,
  MIN_YEAR,
} from "./validation.ts";

describe("assertValidYear", () => {
  test("境界値 1 と 9999 は有効", () => {
    expect(() => assertValidYear(MIN_YEAR)).not.toThrow();
    expect(() => assertValidYear(MAX_YEAR)).not.toThrow();
  });

  test("0 と 10000 は RangeError", () => {
    expect(() => assertValidYear(0)).toThrow(RangeError);
    expect(() => assertValidYear(MAX_YEAR + 1)).toThrow(RangeError);
  });

  test("NaN・非整数・小数点は RangeError", () => {
    expect(() => assertValidYear(NaN)).toThrow(RangeError);
    expect(() => assertValidYear(1.5)).toThrow(RangeError);
    expect(() => assertValidYear(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("assertValidMonth", () => {
  test("1 と 12 は有効", () => {
    expect(() => assertValidMonth(1)).not.toThrow();
    expect(() => assertValidMonth(12)).not.toThrow();
  });

  test("0 と 13 は RangeError", () => {
    expect(() => assertValidMonth(0)).toThrow(RangeError);
    expect(() => assertValidMonth(13)).toThrow(RangeError);
  });

  test("NaN は RangeError", () => {
    expect(() => assertValidMonth(NaN)).toThrow(RangeError);
  });
});

describe("assertValidYearMonth", () => {
  test("有効な組み合わせは通る", () => {
    expect(() => assertValidYearMonth(2026, 9)).not.toThrow();
  });

  test("どちらかが不正なら RangeError", () => {
    expect(() => assertValidYearMonth(0, 9)).toThrow(RangeError);
    expect(() => assertValidYearMonth(2026, 13)).toThrow(RangeError);
  });
});

describe("assertValidWeekStart", () => {
  test("sunday と monday は有効", () => {
    expect(() => assertValidWeekStart("sunday")).not.toThrow();
    expect(() => assertValidWeekStart("monday")).not.toThrow();
  });

  test("その他は RangeError", () => {
    expect(() => assertValidWeekStart("friday")).toThrow(RangeError);
    expect(() => assertValidWeekStart("")).toThrow(RangeError);
  });
});

describe("assertValidDate", () => {
  test("有効な Date は通る", () => {
    expect(() => assertValidDate(new Date(2026, 8, 15))).not.toThrow();
  });

  test("Invalid Date は RangeError", () => {
    expect(() => assertValidDate(new Date("invalid"))).toThrow(RangeError);
  });

  test("Date 以外は RangeError", () => {
    expect(() =>
      assertValidDate(new Date(2026, 8, 15).getTime() as never),
    ).toThrow(RangeError);
  });
});

describe("createDate", () => {
  test("year 0-99 でも正しい年になる（1900年代にずれない）", () => {
    expect(createDate(50, 0, 1).getFullYear()).toBe(50);
    expect(createDate(1, 11, 31).getFullYear()).toBe(1);
    expect(createDate(99, 5, 15).getFullYear()).toBe(99);
  });

  test("月インデックス 0-11 で正しい月になる", () => {
    expect(createDate(2026, 0, 1).getMonth()).toBe(0);
    expect(createDate(2026, 11, 1).getMonth()).toBe(11);
  });

  test("日付はローカル時刻 00:00:00 に丸められる", () => {
    const date = createDate(2026, 8, 15);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
    expect(date.getMilliseconds()).toBe(0);
  });

  test("月末を超える日は翌月にロールする", () => {
    // 2026-02-31 → 2026-03-03
    const date = createDate(2026, 1, 31);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(3);
  });

  test("day 0 は前月の月末になる", () => {
    // monthIndex 2（3月）の day 0 = 2月末
    const date = createDate(2026, 2, 0);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(28);
  });
});

describe("createDate の入力検証", () => {
  test("year 0 と 10000 は RangeError", () => {
    expect(() => createDate(0, 0, 1)).toThrow(RangeError);
    expect(() => createDate(10000, 0, 1)).toThrow(RangeError);
  });

  test("monthIndex が範囲外（-1, 13）は RangeError", () => {
    expect(() => createDate(2026, -1, 1)).toThrow(RangeError);
    expect(() => createDate(2026, 13, 1)).toThrow(RangeError);
  });

  test("monthIndex 12 は翌年1月にロールする", () => {
    const date = createDate(2026, 12, 1);
    expect(date.getFullYear()).toBe(2027);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(1);
  });

  test("day が範囲外（-1, 32）は RangeError", () => {
    expect(() => createDate(2026, 0, -1)).toThrow(RangeError);
    expect(() => createDate(2026, 0, 32)).toThrow(RangeError);
  });

  test("非整数（NaN, 1.5）は RangeError", () => {
    expect(() => createDate(NaN, 0, 1)).toThrow(RangeError);
    expect(() => createDate(2026, 1.5, 1)).toThrow(RangeError);
    expect(() => createDate(2026, 0, 1.5)).toThrow(RangeError);
  });
});
