import { isDateInRange, isSameDay } from "@typescript-calendar-lib/core";

// ─── セル状態クラス ───────────────────────────────────────

export interface CellStateOptions {
  today?: Date;
  highlight?: Date;
  range?: { from: Date; to: Date };
}

// 範囲の from > to は不正入力として RangeError（isDateInRange が検証する）

/** 日付セルの状態（週末・今日・ハイライト・範囲）に応じたCSSクラスを組み立てる */
export function getCellClasses(date: Date, options: CellStateOptions): string {
  const classes: string[] = [];
  const dow = date.getDay();
  if (dow === 0 || dow === 6) classes.push("is-weekend");
  if (options.today && isSameDay(date, options.today)) classes.push("is-today");
  if (options.highlight && isSameDay(date, options.highlight))
    classes.push("is-highlight");
  if (options.range && isDateInRange(date, options.range))
    classes.push("is-in-range");
  return classes.join(" ");
}
