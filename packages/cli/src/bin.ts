#!/usr/bin/env bun
import type {
  HighlightStyle,
  Locale,
  WeekStart,
} from "@typescript-calendar-lib/core";
import { createDate } from "@typescript-calendar-lib/core";
import { calendar } from "./calendar.ts";
import type { ColorSchemeName, ThemeName } from "./theme.ts";

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

/** YYYY-MM-DD 形式の日付文字列をパースする */
export function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  const date = createDate(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;
  return date;
}

/** 指定した候補リストに値が含まれるか検証する */
function validateChoice<T extends string>(
  value: T | undefined,
  choices: readonly T[],
  name: string,
): string | undefined {
  if (value === undefined) return undefined;
  if (!choices.includes(value)) {
    return `Invalid ${name}: "${value}" (expected: ${choices.join(" | ")})`;
  }
  return undefined;
}

/**
 * CLI 引数をパースする。テスト可能なように副作用を分離している。
 */
export function parseArgs(args: readonly string[]): ParseResult {
  const result: CliArgs = {};
  const missing = (name: string): ParseResult => ({
    args: result,
    error: `Missing value for option: ${name}`,
  });

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    const next = (): string | undefined => args[++i];

    switch (arg) {
      case "-h":
      case "--help":
        return { args: result, help: true };
      case "--theme": {
        const value = next();
        if (value === undefined) return missing("--theme");
        result.theme = value as ThemeName;
        break;
      }
      case "--color-scheme": {
        const value = next();
        if (value === undefined) return missing("--color-scheme");
        result.colorScheme = value as ColorSchemeName;
        break;
      }
      case "--color":
        result.color = true;
        break;
      case "--locale": {
        const value = next();
        if (value === undefined) return missing("--locale");
        result.locale = value as Locale;
        break;
      }
      case "--week-start": {
        const value = next();
        if (value === undefined) return missing("--week-start");
        result.weekStart = value as WeekStart;
        break;
      }
      case "--highlight": {
        const value = next();
        if (value === undefined) return missing("--highlight");
        const parsed = parseDate(value);
        if (parsed === null) {
          return {
            args: result,
            error: `Invalid --highlight date: "${value}" (expected YYYY-MM-DD, e.g. 2026-09-08)`,
          };
        }
        result.highlight = parsed;
        break;
      }
      case "--highlight-style": {
        const value = next();
        if (value === undefined) return missing("--highlight-style");
        result.highlightStyle = value as HighlightStyle;
        break;
      }
      default: {
        const numeric = /^-?\d+$/.test(arg);
        if (arg.startsWith("-") && !numeric) {
          return { args: result, error: `Unknown option: ${arg}` };
        }
        if (!numeric) {
          return {
            args: result,
            error: `Invalid argument: "${arg}" (expected a year or month number)`,
          };
        }
        if (result.year === undefined) {
          result.year = Number(arg);
        } else if (result.month === undefined) {
          result.month = Number(arg);
        } else {
          return { args: result, error: `Too many arguments: "${arg}"` };
        }
      }
    }
  }

  // 値のバリデーション
  if (result.year !== undefined && (result.year < 1 || result.year > 9999)) {
    return {
      args: result,
      error: `Invalid year: ${result.year} (expected 1–9999)`,
    };
  }
  if (result.month !== undefined && (result.month < 1 || result.month > 12)) {
    return {
      args: result,
      error: `Invalid month: ${result.month} (expected 1–12)`,
    };
  }

  for (const [value, choices, name] of [
    [result.theme, THEMES, "theme"] as const,
    [result.colorScheme, COLOR_SCHEMES, "color-scheme"] as const,
    [result.locale, LOCALES, "locale"] as const,
    [result.weekStart, WEEK_STARTS, "week-start"] as const,
    [result.highlightStyle, HIGHLIGHT_STYLES, "highlight-style"] as const,
  ]) {
    const error = validateChoice(value, choices, name);
    if (error) return { args: result, error };
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
