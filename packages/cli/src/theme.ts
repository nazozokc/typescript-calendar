// ─── テーマ ───────────────────────────────────────────────

/** 組み込みテーマ名。カスタムテーマは CliTheme オブジェクトを直接渡せる */
export type ThemeName = "default" | "modern";

/** 枠線の文字セット（modern テーマで使用） */
export interface FrameChars {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  /** 水平線 */
  h: string;
  /** 垂直線 */
  v: string;
  /** ヘッダー/本文の区切り行で使う交差（┬ や ┼） */
  j: string;
  /** 下端区切りで使う交差（┴） */
  footJ: string;
}

/** 文字ベースの見た目定義 */
export interface CliTheme {
  /** セル幅（日付表記の文字幅） */
  cellWidth: number;
  /** セル間の区切り文字（default: " " / modern: "│"） */
  separator: string;
  /** 枠線文字。null なら枠なし */
  frame: FrameChars | null;
}

export const THEMES: Record<ThemeName, CliTheme> = {
  default: {
    cellWidth: 3,
    separator: " ",
    frame: null,
  },
  modern: {
    cellWidth: 3,
    separator: "│",
    frame: {
      topLeft: "┌",
      topRight: "┐",
      bottomLeft: "└",
      bottomRight: "┘",
      h: "─",
      v: "│",
      j: "┬",
      footJ: "┴",
    },
  },
};

export function resolveTheme(theme?: ThemeName | CliTheme): CliTheme {
  return typeof theme === "string"
    ? (THEMES[theme] ?? THEMES.default)
    : (theme ?? THEMES.default);
}

// ─── カラースキーム ───────────────────────────────────────

/** 組み込みカラースキーム名。カスタムは CliPalette を直接渡せる */
export type ColorSchemeName =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "mono";

/**
 * ANSIカラーパレット。
 * 各フィールドは前景色（またはハイライト時の背景）のANSIコード。
 * undefined はその要素を着色しない。
 */
export interface CliPalette {
  title?: number;
  weekday?: number;
  day?: number;
  weekend?: number;
  today?: number;
  /** highlightStyle: "reverse" のときに使うコード（default は 7 = 反転） */
  highlight?: number;
  range?: number;
  frame?: number;
  dim?: number;
}

export const COLOR_SCHEMES: Record<ColorSchemeName, CliPalette> = {
  /** 従来どおり。着色は range(黄) と highlight(反転) のみ */
  default: {
    range: 33,
    highlight: 7,
  },
  ocean: {
    title: 36,
    weekday: 36,
    day: 37,
    weekend: 34,
    today: 36,
    highlight: 7,
    range: 34,
    frame: 36,
    dim: 90,
  },
  forest: {
    title: 32,
    weekday: 32,
    day: 37,
    weekend: 90,
    today: 32,
    highlight: 7,
    range: 32,
    frame: 32,
    dim: 90,
  },
  sunset: {
    title: 35,
    weekday: 35,
    day: 37,
    weekend: 33,
    today: 35,
    highlight: 7,
    range: 35,
    frame: 35,
    dim: 90,
  },
  mono: {
    title: 37,
    weekday: 37,
    day: 37,
    weekend: 90,
    today: 37,
    highlight: 7,
    range: 90,
    frame: 90,
    dim: 90,
  },
};

export function resolveColorScheme(
  scheme?: ColorSchemeName | CliPalette,
): CliPalette {
  return typeof scheme === "string"
    ? (COLOR_SCHEMES[scheme] ?? COLOR_SCHEMES.default)
    : (scheme ?? COLOR_SCHEMES.default);
}
