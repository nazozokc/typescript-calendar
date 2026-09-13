import { isSameDay } from "@typescript-calendar-lib/core";
import type { CalendarCell, MonthData } from "./types.ts";

// ─── セル検索 ────────────────────────────────────────────

type CellPos = { row: number; col: number } | null;

/** 月データを行優先で走査し、条件に一致する最初のセル位置を返す */
function findCell(
  monthData: MonthData,
  match: (cell: CalendarCell) => boolean,
): CellPos {
  for (let row = 0; row < monthData.cells.length; row++) {
    const col = monthData.cells[row]!.findIndex(match);
    if (col !== -1) return { row, col };
  }
  return null;
}

/** 月データから「今日」のセル位置を探す。なければ null */
export function findTodayCell(monthData: MonthData): CellPos {
  return findCell(monthData, (c) => c.isToday);
}

/** 月データから指定日付のセル位置を探す。なければ null */
export function findDateCell(monthData: MonthData, date: Date): CellPos {
  return findCell(monthData, (c) => c.date !== null && isSameDay(c.date, date));
}

/** 月データから最初の日付セルを探す */
export function findFirstDayCell(monthData: MonthData): CellPos {
  return findCell(monthData, (c) => c.day !== null);
}
