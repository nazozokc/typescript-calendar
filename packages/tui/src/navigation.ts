import {
  assertValidDate,
  MAX_YEAR,
  MIN_YEAR,
} from "@typescript-calendar-lib/core";
import { buildMonthData } from "./month-data.ts";
import { shiftMonth } from "./month-math.ts";
import { findDateCell, findTodayCell } from "./search.ts";
import { rebuildState } from "./state.ts";
import type { CalendarState, MonthData, MonthDirection } from "./types.ts";

// ─── 年月の算術 ───────────────────────────────────────────

/**
 * year/month を delta ヶ月ずらす（月跨ぎ・年跨ぎを正規化）。
 *
 * 詳細な挙動は month-math.ts を参照。年は MIN_YEAR..MAX_YEAR にクランプされる。
 */
export { shiftMonth };

// ─── 公開API ─────────────────────────────────────────────

type LocateDate = (data: MonthData) => { row: number; col: number } | null;

/** カーソル/選択/オプションを保って年月で状態を再構築する */
function withMonth(
  state: CalendarState,
  year: number,
  month: number,
): CalendarState {
  return rebuildState(
    year,
    month,
    state.cursor,
    state.selectedDate,
    state.options,
  );
}

/** 月データを構築してカーソルを置き、状態を再構築する */
function jumpTo(
  state: CalendarState,
  year: number,
  month: number,
  locate: LocateDate,
): CalendarState {
  const data = buildMonthData(year, month, state.options);
  return rebuildState(
    year,
    month,
    locate(data),
    state.selectedDate,
    state.options,
    data,
  );
}

/** 前月/翌月へ移動する（カーソルは新しい月の範囲にクランプされる） */
export function navigateMonth(
  state: CalendarState,
  direction: MonthDirection,
): CalendarState {
  const { year, month } = shiftMonth(
    state.year,
    state.month,
    direction === "next" ? 1 : -1,
  );
  return withMonth(state, year, month);
}

/** 前年/翌年へ移動する（サポート範囲の端では移動しない） */
export function navigateYear(
  state: CalendarState,
  direction: MonthDirection,
): CalendarState {
  const year = state.year + (direction === "next" ? 1 : -1);
  if (year < MIN_YEAR || year > MAX_YEAR) return state;
  return withMonth(state, year, state.month);
}

/** 指定した年月へジャンプする。month は正規化される（例: 13 → 翌年1月） */
export function goToMonth(
  state: CalendarState,
  year: number,
  month: number,
): CalendarState {
  return withMonth(state, year, month);
}

/** 指定した日付の月へジャンプし、カーソルをその日付のセルに置く */
export function goToDate(state: CalendarState, date: Date): CalendarState {
  assertValidDate(date);
  return jumpTo(state, date.getFullYear(), date.getMonth() + 1, (data) =>
    findDateCell(data, date),
  );
}

/** 今日の月へジャンプし、カーソルを今日のセルに置く */
export function goToToday(state: CalendarState): CalendarState {
  const { today } = state.options;
  return jumpTo(
    state,
    today.getFullYear(),
    today.getMonth() + 1,
    findTodayCell,
  );
}
