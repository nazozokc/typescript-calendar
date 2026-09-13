import type { FrameChars } from "./theme.ts";

// ─── 枠線 ─────────────────────────────────────────────────

/** 枠内のコンテンツ幅（例: 7列×3幅+区切り6 = 27） */
export function innerWidth(cellWidth: number, cols: number): number {
  return cols * cellWidth + (cols - 1);
}

/** セル幅の水平線を cols 個つなげた区切り線を生成する */
function divider(
  frame: FrameChars,
  cellWidth: number,
  cols: number,
  left: string,
  right: string,
  join: string,
): string {
  const segments = Array<string>(cols).fill(frame.h.repeat(cellWidth));
  return `${left}${segments.join(join)}${right}`;
}

/** 上枠: ┌────┬────...────┐ */
export function topBorder(
  frame: FrameChars,
  cellWidth: number,
  cols: number,
): string {
  return `${frame.topLeft}${frame.h.repeat(innerWidth(cellWidth, cols))}${frame.topRight}`;
}

/** 下枠: └────┴────...────┘ */
export function bottomBorder(
  frame: FrameChars,
  cellWidth: number,
  cols: number,
): string {
  return divider(
    frame,
    cellWidth,
    cols,
    frame.bottomLeft,
    frame.bottomRight,
    frame.footJ,
  );
}

/** 区切り行: ├────┬────...┬────┤ */
export function separatorRow(
  frame: FrameChars,
  cellWidth: number,
  cols: number,
): string {
  return divider(frame, cellWidth, cols, "├", "┤", frame.j);
}
