import type {
  CalendarState,
  CalendarStateOptions,
  Direction,
  MonthDirection,
} from "@typescript-calendar-lib/tui";
import {
  buildMonthData,
  clearSelection,
  createCalendarState,
  getCursorDate,
  getSelectedDate,
  goToToday,
  moveCursor,
  navigateMonth,
  rebuildState,
  resolveOptions,
  selectDate,
} from "@typescript-calendar-lib/tui";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCalendarStateOptions
  extends Pick<
    CalendarStateOptions,
    "locale" | "weekStart" | "today" | "highlight" | "range"
  > {
  initialYear?: number;
  initialMonth?: number;
}

export interface UseCalendarStateReturn {
  /** 現在のカレンダー状態 */
  state: CalendarState;
  /** カーソルを指定方向に移動 (wrap around) */
  moveCursor: (direction: Direction) => void;
  /** 前月/翌月へ移動 */
  goNext: () => void;
  goPrev: () => void;
  /** 今日の月へジャンプ */
  goToday: () => void;
  /** カーソル位置の日付を選択 */
  selectDate: () => void;
  /** 選択を解除 */
  clearSelection: () => void;
  /** カーソル位置の日付（null の場合あり） */
  cursorDate: Date | null;
  /** 選択済み日付（null の場合あり） */
  selectedDate: Date | null;
}

/** undefined を含む日付を値（時刻）で比較する */
function sameDateValue(a: Date | undefined, b: Date | undefined): boolean {
  return (a?.getTime() ?? -1) === (b?.getTime() ?? -1);
}

/** オプションの「値」が等しいか比較する（Date は getTime、参照ではない） */
function sameOptionsValue(
  a: UseCalendarStateOptions,
  b: UseCalendarStateOptions,
): boolean {
  return (
    a.initialYear === b.initialYear &&
    a.initialMonth === b.initialMonth &&
    a.locale === b.locale &&
    a.weekStart === b.weekStart &&
    sameDateValue(a.today, b.today) &&
    sameDateValue(a.highlight, b.highlight) &&
    sameDateValue(a.range?.from, b.range?.from) &&
    sameDateValue(a.range?.to, b.range?.to)
  );
}

/**
 * tui の不変状態マシンを包む React hook。
 * カレンダーのインタラクティブ操作をシンプルに利用できる。
 *
 * `options` の値（locale / weekStart / today / highlight / range /
 * initialYear / initialMonth）が変わると、カーソル・選択を保ったまま
 * 状態が再構築される。比較は値（Date は getTime）で行うため、インラインで
 * オプションを渡しても値が同じなら再構築されない。
 *
 * `today` を省略した場合、最初に解決された値が状態に固定され、以降も
 * 引き継がれる（毎レンダリング `new Date()` を渡さなくてよい）。
 */
export function useCalendarState(
  options: UseCalendarStateOptions = {},
): UseCalendarStateReturn {
  const [state, setState] = useState<CalendarState>(() =>
    createCalendarState({
      initialYear: options.initialYear,
      initialMonth: options.initialMonth,
      today: options.today,
      locale: options.locale,
      weekStart: options.weekStart,
      highlight: options.highlight,
      range: options.range,
    }),
  );

  // options の「値の変化」を検知して状態を再構築する。
  // 初回は prevOptions が同一なので何もしない。値が同じままの再レンダリング
  // でも何もしないため、インラインリテラルを毎回渡しても無限ループしない。
  const prevOptions = useRef(options);
  useEffect(() => {
    if (sameOptionsValue(prevOptions.current, options)) return;
    // initialYear/initialMonth は「初期値」。値が実際に変わった時だけ適用し、
    // 変わっていない場合はナビゲーション後の現在位置 (prev.year/month) を維持する
    // （options 変更で表示月が初期値に引き戻されるのを防ぐ）。
    const prevInitialYear = prevOptions.current.initialYear;
    const prevInitialMonth = prevOptions.current.initialMonth;
    prevOptions.current = options;
    setState((prev) => {
      const resolved = resolveOptions({
        // today が省略されたら前回の値を引き継ぐ（状態に固定された今日を維持）
        today: options.today ?? prev.options.today,
        locale: options.locale ?? prev.options.locale,
        weekStart: options.weekStart ?? prev.options.weekStart,
        highlight: options.highlight,
        range: options.range,
      });
      const year =
        options.initialYear !== undefined &&
        options.initialYear !== prevInitialYear
          ? options.initialYear
          : prev.year;
      const month =
        options.initialMonth !== undefined &&
        options.initialMonth !== prevInitialMonth
          ? options.initialMonth
          : prev.month;
      // 範囲外の month は rebuildState 側で正規化される（state と monthData の乖離を防ぐ）
      const monthData = buildMonthData(year, month, resolved);
      return rebuildState(
        year,
        month,
        prev.cursor,
        prev.selectedDate,
        resolved,
        monthData,
      );
    });
  }, [options]);

  return {
    state,
    moveCursor: useCallback(
      (direction: Direction) => setState((prev) => moveCursor(prev, direction)),
      [],
    ),
    goNext: useCallback(
      () => setState((prev) => navigateMonth(prev, "next")),
      [],
    ),
    goPrev: useCallback(
      () => setState((prev) => navigateMonth(prev, "prev")),
      [],
    ),
    goToday: useCallback(() => setState((prev) => goToToday(prev)), []),
    selectDate: useCallback(() => setState((prev) => selectDate(prev)), []),
    clearSelection: useCallback(
      () => setState((prev) => clearSelection(prev)),
      [],
    ),
    cursorDate: getCursorDate(state),
    selectedDate: getSelectedDate(state),
  };
}

export type { Direction, MonthDirection };
