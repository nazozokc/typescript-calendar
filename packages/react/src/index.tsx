import type { CalendarOptions } from "@typescript-calendar-lib/core";
import {
  buildMonthGrid,
  createDate,
  getMonthName,
  getWeekdayHeaders,
} from "@typescript-calendar-lib/core";
import type { CSSProperties } from "react";
import { getCellClasses } from "./cell-classes.ts";
import type { CalendarSize } from "./size.ts";
import { buildSizeStyle, isSizeName } from "./size.ts";
import type {
  ColorSchemeName,
  ReactColorScheme,
  ReactTheme,
  ThemeName,
} from "./themes.ts";
import { resolveColorScheme, resolveTheme } from "./themes.ts";
import "./calendar.css";

export type {
  CalendarCustomSize,
  CalendarSize,
  CalendarSizeName,
} from "./size.ts";

export interface CalendarProps {
  year: number;
  month: number;
  locale?: CalendarOptions["locale"];
  weekStart?: CalendarOptions["weekStart"];
  highlight?: Date;
  /** 範囲強調 */
  range?: { from: Date; to: Date };
  /** 今日の基準日。カラースキームの today 着色に使用 */
  today?: Date;
  /** 見た目テーマ。既定は "default" */
  theme?: ThemeName | ReactTheme;
  /** カラースキーム。既定は "default" */
  colorScheme?: ColorSchemeName | ReactColorScheme;
  /** セルサイズ。既定は "md"。{ width, height } で自由に指定できる */
  size?: CalendarSize;
  /** root 要素に追加するスタイル。CSS変数（--cal-*）で自由に上書きできる */
  style?: CSSProperties;

  // ── インタラクション ──

  /** インタラクティブモードを有効にする。セルクリック・ホバー・キーボード選択が可能になる */
  interactive?: boolean;
  /** セルクリック時のコールバック */
  onDateClick?: (date: Date) => void;
  /** セルホバー時のコールバック */
  onDateHover?: (date: Date) => void;
}

/** 月カレンダーコンポーネント */
export function Calendar({
  year,
  month,
  locale = "en",
  weekStart = "sunday",
  highlight,
  range,
  today,
  theme = "default",
  colorScheme = "default",
  size = "md",
  style,
  interactive = false,
  onDateClick,
  onDateHover,
}: CalendarProps) {
  const cellDate = (day: number): Date => createDate(year, month - 1, day);
  const cellClass = (day: number): string | undefined =>
    getCellClasses(cellDate(day), { today, highlight, range }) || undefined;

  const handleCellClick = (day: number) => {
    if (interactive && onDateClick) onDateClick(cellDate(day));
  };

  const handleCellHover = (day: number) => {
    if (interactive && onDateHover) onDateHover(cellDate(day));
  };

  return (
    <div
      className={`calendar ${resolveTheme(theme).className}${isSizeName(size) ? ` calendar-size-${size}` : ""}${interactive ? " calendar-interactive" : ""}`}
      style={{
        ...(resolveColorScheme(colorScheme) as CSSProperties),
        ...buildSizeStyle(size),
        ...style,
      }}
    >
      <div className="calendar-header">
        <h2>
          {getMonthName(locale, month)} {year}
        </h2>
      </div>
      <table>
        <thead>
          <tr>
            {getWeekdayHeaders(locale, weekStart).map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buildMonthGrid(year, month, weekStart).map((row, i) => {
            if (row.every((d) => d === null)) return null;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: 月グリッドは静的で並び順が変わらない
              <tr key={i}>
                {row.map((day, j) => {
                  if (day === null)
                    // biome-ignore lint/suspicious/noArrayIndexKey: パディングセルは位置が唯一の識別子
                    return <td key={j} />;
                  return (
                    <td key={day} className={cellClass(day)}>
                      {interactive ? (
                        <button
                          type="button"
                          className="calendar-day-btn"
                          onClick={() => handleCellClick(day)}
                          onMouseEnter={() => handleCellHover(day)}
                          tabIndex={0}
                          aria-label={`${getMonthName(locale, month)} ${day}, ${year}`}
                        >
                          {day}
                        </button>
                      ) : (
                        day
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Calendar;

export type {
  UseCalendarStateOptions,
  UseCalendarStateReturn,
} from "./hooks.ts";
export { useCalendarState } from "./hooks.ts";
export type {
  ColorSchemeName,
  ReactColorScheme,
  ReactTheme,
  ThemeName,
} from "./themes.ts";
export {
  COLOR_SCHEMES,
  resolveColorScheme,
  resolveTheme,
  THEMES,
} from "./themes.ts";
