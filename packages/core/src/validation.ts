// ─── 入力検証 ─────────────────────────────────────────────

/** サポートする年の最小値（JS Date は 0-99 を 1900+年 と解釈するため 1 から） */
export const MIN_YEAR = 1;
/** サポートする年の最大値 */
export const MAX_YEAR = 9999;

/** 値が min-max の整数であることを検証する（不正なら RangeError） */
function assertIntegerInRange(
  name: string,
  value: number,
  min: number,
  max: number,
): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(
      `Invalid ${name}: ${value} (expected an integer between ${min} and ${max})`,
    );
  }
}

/** 年が 1-9999 の整数であることを検証する */
export function assertValidYear(year: number): void {
  assertIntegerInRange("year", year, MIN_YEAR, MAX_YEAR);
}

/** 月が 1-12 の整数であることを検証する */
export function assertValidMonth(month: number): void {
  assertIntegerInRange("month", month, 1, 12);
}

/** 年の組み合わせ（year と month）を検証する */
export function assertValidYearMonth(year: number, month: number): void {
  assertValidYear(year);
  assertValidMonth(month);
}

/** 週の開始曜日を検証する */
export function assertValidWeekStart(weekStart: string): void {
  if (weekStart !== "sunday" && weekStart !== "monday") {
    throw new RangeError(
      `Invalid weekStart: "${weekStart}" (expected "sunday" or "monday")`,
    );
  }
}

/** Date が有効（Invalid Date でない）ことを検証する */
export function assertValidDate(date: Date): void {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid Date: ${String(date)}`);
  }
}

/**
 * ローカルの指定日 00:00:00 を生成する。
 * `new Date(year, ...)` は year 0-99 を 1900+year と解釈するため、
 * setFullYear を使って year 0-99 も正しく扱えるようにする。
 */
export function createDate(
  year: number,
  monthIndex: number,
  day: number,
): Date {
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, monthIndex, day);
  return date;
}
