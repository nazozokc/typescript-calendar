#!/usr/bin/env bun
import type {
  HighlightStyle,
  Locale,
  WeekStart,
} from "@typescript-calendar-lib/core";
import { createDate } from "@typescript-calendar-lib/core";
import { calendar } from "./calendar.ts";
import type { ColorSchemeName, ThemeName } from "./theme.ts";

export interface CliArgs {
  year?: number;
  month?: number;
  theme?: ThemeName;
  colorScheme?: ColorSchemeName;
  color?: boolean;
  locale?: Locale;
  weekStart?: WeekStart;
  highlight?: Date;
  highlightStyle?: HighlightStyle;
}

export interface ParseResult {
  args: CliArgs;
  error?: string;
  help?: boolean;
}

const THEMES: readonly ThemeName[] = ["default", "modern"];
const COLOR_SCHEMES: readonly ColorSchemeName[] = [
  "default",
  "ocean",
  "forest",
  "sunset",
  "mono",
];
const LOCALES: readonly Locale[] = ["en", "ja", "es", "de", "fr", "ko", "zh"];
const WEEK_STARTS: readonly WeekStart[] = ["sunday", "monday"];
const HIGHLIGHT_STYLES: readonly HighlightStyle[] = ["bracket", "reverse"];

/** 値を一つ取るオプションと、代入先のフィールド名 */
const VALUE_OPTIONS: Record<string, keyof CliArgs> = {
  "--theme": "theme",
  "--color-scheme": "colorScheme",
  "--locale": "locale",
  "--week-start": "weekStart",
  "--highlight-style": "highlightStyle",
};

/** YYYY-MM-DD 形式の日付文字列をパースする */
export function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const date = createDate(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * CLI 引数をパースする。テスト可能なように副作用を分離している。
 */
export function parseArgs(args: readonly string[]): ParseResult {
  const result: CliArgs = {};
  const error = (message: string): ParseResult => ({
    args: result,
    error: message,
  });

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    if (arg === "-h" || arg === "--help") {
      return { args: result, help: true };
    }
    if (arg === "--color") {
      result.color = true;
      continue;
    }
    if (arg === "--highlight") {
      const value = args[++i];
      if (value === undefined) {
        return error("Missing value for option: --highlight");
      }
      const parsed = parseDate(value);
      if (parsed === null) {
        return error(
          `Invalid --highlight date: "${value}" (expected YYYY-MM-DD, e.g. 2026-09-08)`,
        );
      }
      result.highlight = parsed;
      continue;
    }

    const key = VALUE_OPTIONS[arg];
    if (key !== undefined) {
      const value = args[++i];
      if (value === undefined) {
        return error(`Missing value for option: ${arg}`);
      }
      (result as Record<string, unknown>)[key] = value;
      continue;
    }

    const numeric = /^-?\d+$/.test(arg);
    if (arg.startsWith("-") && !numeric) {
      return error(`Unknown option: ${arg}`);
    }
    if (!numeric) {
      return error(
        `Invalid argument: "${arg}" (expected a year or month number)`,
      );
    }
    if (result.year === undefined) {
      result.year = Number(arg);
    } else if (result.month === undefined) {
      result.month = Number(arg);
    } else {
      return error(`Too many arguments: "${arg}"`);
    }
  }

  // 値のバリデーション
  if (result.year !== undefined && (result.year < 1 || result.year > 9999)) {
    return error(`Invalid year: ${result.year} (expected 1–9999)`);
  }
  if (result.month !== undefined && (result.month < 1 || result.month > 12)) {
    return error(`Invalid month: ${result.month} (expected 1–12)`);
  }

  const choiceTable: Array<[string | undefined, readonly string[], string]> = [
    [result.theme, THEMES, "theme"],
    [result.colorScheme, COLOR_SCHEMES, "color-scheme"],
    [result.locale, LOCALES, "locale"],
    [result.weekStart, WEEK_STARTS, "week-start"],
    [result.highlightStyle, HIGHLIGHT_STYLES, "highlight-style"],
  ];
  for (const [value, choices, name] of choiceTable) {
    if (value !== undefined && !choices.includes(value)) {
      return error(
        `Invalid ${name}: "${value}" (expected: ${choices.join(" | ")})`,
      );
    }
  }

  return { args: result };
}

export function printUsage(): string {
  return `Usage: typescript-calendar-lib [YYYY] [MM] [options]

  typescript-calendar-lib                       Render the current month
  typescript-calendar-lib 2026                  Render the current month of 2026
  typescript-calendar-lib 2026 9                Render September 2026

Options:
  --theme <name>           Look: default | modern (default: default)
  --color-scheme <name>    Colors: default | ocean | forest | sunset | mono
  --color                  Enable ANSI colors
  --locale <lang>          Language: en | ja | es | de | fr | ko | zh (default: en)
  --week-start <day>       First weekday: sunday | monday (default: sunday)
  --highlight <YYYY-MM-DD> Highlight a date (e.g. 2026-09-08)
  --highlight-style <style> Highlight style: bracket | reverse (default: bracket)
  -h, --help               Show this help
`;
}

if (import.meta.main) {
  const { args, error, help } = parseArgs(process.argv.slice(2));

  if (help) {
    console.log(printUsage());
    process.exit(0);
  }
  if (error) {
    console.error(`Error: ${error}`);
    console.error(printUsage());
    process.exit(1);
  }

  const now = new Date();
  const year = args.year ?? now.getFullYear();
  const month = args.month ?? now.getMonth() + 1;

  console.log(
    calendar({
      year,
      month,
      theme: args.theme,
      colorScheme: args.colorScheme,
      color: args.color,
      locale: args.locale,
      weekStart: args.weekStart,
      highlight: args.highlight,
      highlightStyle: args.highlightStyle,
    }),
  );
}
