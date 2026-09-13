import { getMonthRange } from "@typescript-calendar-lib/core";
import { renderMonth, renderYear } from "./render.ts";
import type {
  CalendarOptions,
  CalendarRangeOptions,
  CalendarYearOptions,
} from "./types.ts";

/**
 * 月カレンダーをテキストで返す
 */
export function calendar(options: CalendarOptions): string {
  return renderMonth(options.year, options.month, options);
}

/**
 * 年間カレンダーを4列×3行でテキストで返す
 */
export function calendarYear(options: CalendarYearOptions): string {
  return renderYear(options.year, options);
}

/**
 * 任意の日付範囲のカレンダーをテキストで返す
 */
export function calendarRange(options: CalendarRangeOptions): string {
  const months = getMonthRange(options.from, options.to);
  return months
    .map(({ year, month }) => renderMonth(year, month, options))
    .join("\n\n");
}
