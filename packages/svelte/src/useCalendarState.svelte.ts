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

export interface UseCalendarStateOptions
  extends Pick<
    CalendarStateOptions,
    "locale" | "weekStart" | "today" | "highlight" | "range"
  > {
  initialYear?: number;
  initialMonth?: number;
}

/**
 * `useCalendarState` の first 引数。
 * - 変更しない設定: オブジェクトを直接渡す
 * - props や $state の値に追従させる: `() => ({ ... })` の getter を渡す。
 *   （$derived オブジェクトを渡しても、追跡は宣言したファイル内でのみ
 *   有効なため、別モジュールのフックには伝わらない点に注意）
 */
export type UseCalendarStateOptionsInput =
  | UseCalendarStateOptions
  | (() => UseCalendarStateOptions);

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
 * tui の不変状態機械を包む Svelte 5 (runes) のリアクティブ状態。
 * カレンダーのインタラクティブ操作をシンプルに利用できる。
 *
 * リアクティブに追従させたい設定（コンポーネントの props や $state の値）が
 * ある場合は、`options` にリテラルではなく getter 関数を渡す:
 *
 * ```svelte
 * <script>
 *   let { highlight, today } = $props();
 *   const cal = useCalendarState(() => ({
 *     initialYear: 2026,
 *     initialMonth: 9,
 *     today,
 *     highlight,
 *   }));
 * </script>
 * ```
 *
 * getter が返す値が変わると、カーソル・選択を保ったまま状態が再構築される。
 * 値が同じままの再評価では何もしない。プレーンなオブジェクトを渡した場合は
 * 初期値としてのみ使われ、以降は更新されない。
 *
 * `today` を省略した場合、最初に解決された値が状態に固定され、以降も
 * 引き継がれる（毎回 `new Date()` を渡さなくてよい）。
 */
export function useCalendarState(
  options: UseCalendarStateOptionsInput = {},
): UseCalendarStateReturn {
  const getter = typeof options === "function" ? options : () => options;

  let state = $state(
    createCalendarState({
      initialYear: getter().initialYear,
      initialMonth: getter().initialMonth,
      today: getter().today,
      locale: getter().locale,
      weekStart: getter().weekStart,
      highlight: getter().highlight,
      range: getter().range,
    }),
  );

  // options の「値の変化」を検知して状態を再構築する。
  // getter を effect 内で呼び出すことで、呼び出し元ファイルで追跡される
  // props / $state への読み取りが依存として登録され、値が変わると
  // この effect が再実行される。値が同じままの再評価では何もしない。
  let prev = getter();
  $effect(() => {
    const next = getter();
    if (sameOptionsValue(prev, next)) return;

    // initialYear/initialMonth は「初期値」。値が実際に変わった時だけ適用し、
    // 変わっていない場合はナビゲーション後の現在位置を維持する。
    const prevInitialYear = prev.initialYear;
    const prevInitialMonth = prev.initialMonth;
    prev = next;
    const resolved = resolveOptions({
      // today が省略されたら前回の値を引き継ぐ（状態に固定された今日を維持）
      today: next.today ?? state.options.today,
      locale: next.locale ?? state.options.locale,
      weekStart: next.weekStart ?? state.options.weekStart,
      highlight: next.highlight,
      range: next.range,
    });
    const year =
      next.initialYear !== undefined && next.initialYear !== prevInitialYear
        ? next.initialYear
        : state.year;
    const month =
      next.initialMonth !== undefined && next.initialMonth !== prevInitialMonth
        ? next.initialMonth
        : state.month;
    // 範囲外の month は rebuildState 側で正規化される（state と monthData の乖離を防ぐ）
    const monthData = buildMonthData(year, month, resolved);
    state = rebuildState(
      year,
      month,
      state.cursor,
      state.selectedDate,
      resolved,
      monthData,
    );
  });

  return {
    get state() {
      return state;
    },
    get cursorDate() {
      return getCursorDate(state);
    },
    get selectedDate() {
      return getSelectedDate(state);
    },
    moveCursor: (direction: Direction) => {
      state = moveCursor(state, direction);
    },
    goNext: () => {
      state = navigateMonth(state, "next");
    },
    goPrev: () => {
      state = navigateMonth(state, "prev");
    },
    goToday: () => {
      state = goToToday(state);
    },
    selectDate: () => {
      state = selectDate(state);
    },
    clearSelection: () => {
      state = clearSelection(state);
    },
  };
}

export type { Direction, MonthDirection };
