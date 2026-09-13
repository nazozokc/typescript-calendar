// ─── ANSI 色付け ─────────────────────────────────────────

import { displayWidth } from "./align.ts";

const ANSI_PATTERN = new RegExp(`${"\u001b"}\\[[0-9;]*m`, "g");

/** ANSI コードを付与する（code が undefined ならそのまま） */
export function colorize(
  text: string,
  code: number | undefined,
  enabled: boolean,
): string {
  if (!enabled || code === undefined) return text;
  return `\u001b[${code}m${text}\u001b[0m`;
}

/** ANSI エスケープシーケンスを除去した文字列を返す */
export function stripAnsi(text: string): string {
  return text.replace(ANSI_PATTERN, "");
}

/** ANSI エスケープシーケンスを除去した表示幅を返す（全角文字は2列） */
export function visibleWidth(text: string): number {
  return displayWidth(stripAnsi(text));
}
