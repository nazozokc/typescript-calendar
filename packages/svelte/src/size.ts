import type { CSSProperties } from "./style.js";

// ─── セルサイズ ───────────────────────────────────────────

/** 組み込みサイズ名 */
export type CalendarSizeName = "sm" | "md" | "lg";

/** カスタムセルサイズ。数値は px、文字列は CSS 長さのまま渡す */
export interface CalendarCustomSize {
  width?: number | string;
  height?: number | string;
}

/** セルサイズ指定 */
export type CalendarSize = CalendarSizeName | CalendarCustomSize;

/** 組み込みサイズ名のみ真を返す（未知の文字列はカスタムサイズとして扱わない） */
export function isSizeName(size: CalendarSize): size is CalendarSizeName {
  return typeof size === "string" && ["sm", "md", "lg"].includes(size);
}

function toCssLength(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

export function buildSizeStyle(size: CalendarSize): CSSProperties {
  if (isSizeName(size)) return {};
  const style: Record<string, string> = {};
  if (size.width !== undefined) style["--cal-cell-w"] = toCssLength(size.width);
  if (size.height !== undefined)
    style["--cal-cell-h"] = toCssLength(size.height);
  return style;
}
