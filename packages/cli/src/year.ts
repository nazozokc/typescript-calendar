import { displayWidth } from "./align.ts";
import { stripAnsi } from "./ansi.ts";
import { renderMonth } from "./month.ts";
import type { RenderMonthOptions } from "./types.ts";

/**
 * 年間カレンダーを4列×3行でテキストで返す
 *
 * 列幅・パディングは「ANSI 除去後のターミナル表示幅」で計算する。
 * 全角文字（日本語・韓国語・中国語の月名や曜日）も正しく揃う。
 */
export function renderYear(
  year: number,
  options: RenderMonthOptions = {},
): string {
  const widthOf = (line: string): number => displayWidth(stripAnsi(line));

  const months = Array.from({ length: 12 }, (_, i) =>
    renderMonth(year, i + 1, options).split("\n"),
  );
  const maxLines = Math.max(...months.map((lines) => lines.length));
  const colWidths = months.map((lines) => Math.max(...lines.map(widthOf)));

  /** 月の各行をその列幅まで右パディングする（行が足りなければ空行として埋める） */
  const padMonth = (monthIdx: number): string[] =>
    Array.from({ length: maxLines }, (_, li) => {
      const line = months[monthIdx]![li] ?? "";
      return (
        line + " ".repeat(Math.max(0, colWidths[monthIdx]! - widthOf(line)))
      );
    });

  const padded = months.map((_, mi) => padMonth(mi));

  const rows: string[] = [];
  for (let row = 0; row < 3; row++) {
    rows.push(
      Array.from({ length: maxLines }, (_, li) =>
        Array.from({ length: 4 }, (_, col) => {
          const monthIdx = row * 4 + col;
          return monthIdx < 12 ? padded[monthIdx]![li]! : "";
        }).join("    "),
      ).join("\n"),
    );
  }

  return rows.join("\n\n");
}
