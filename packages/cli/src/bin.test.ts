import { describe, expect, test } from "vitest";
import { parseArgs, parseDate } from "./bin.ts";

describe("parseDate", () => {
  test("有効な日付をパースする", () => {
    expect(parseDate("2026-09-08")).toEqual(new Date(2026, 8, 8));
  });

  test("月の範囲外は null", () => {
    expect(parseDate("2026-13-01")).toBeNull();
  });

  test("日の範囲外は null", () => {
    expect(parseDate("2026-09-32")).toBeNull();
  });

  test("月の長さを超える日付は null", () => {
    expect(parseDate("2026-02-30")).toBeNull();
    expect(parseDate("2026-04-31")).toBeNull();
    expect(parseDate("2025-02-29")).toBeNull(); // 平年の2月29日
  });

  test("うるう年の2月29日は有効", () => {
    expect(parseDate("2024-02-29")).toEqual(new Date(2024, 1, 29));
  });

  test("形式が不正なら null", () => {
    expect(parseDate("2026/09/08")).toBeNull();
    expect(parseDate("2026-9-8")).toBeNull();
    expect(parseDate("hello")).toBeNull();
  });

  test("year 0000 は null（1900年代にずれない）", () => {
    expect(parseDate("0000-06-15")).toBeNull();
  });

  test("year 0050 は正しくパース（1950年代にずれない）", () => {
    const date = parseDate("0050-06-15");
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(50);
  });
});

describe("parseArgs", () => {
  test("引数なしは空のオプション", () => {
    expect(parseArgs([]).args).toEqual({});
  });

  test("year / month の位置引数", () => {
    const { args } = parseArgs(["2026", "9"]);
    expect(args.year).toBe(2026);
    expect(args.month).toBe(9);
  });

  test("year のみ", () => {
    const { args } = parseArgs(["2026"]);
    expect(args.year).toBe(2026);
    expect(args.month).toBeUndefined();
  });

  test("--theme と --color-scheme", () => {
    const { args } = parseArgs([
      "--theme",
      "modern",
      "--color-scheme",
      "ocean",
    ]);
    expect(args.theme).toBe("modern");
    expect(args.colorScheme).toBe("ocean");
  });

  test("--color フラグ", () => {
    const { args } = parseArgs(["--color"]);
    expect(args.color).toBe(true);
  });

  test("--locale と --week-start", () => {
    const { args } = parseArgs(["--locale", "ja", "--week-start", "monday"]);
    expect(args.locale).toBe("ja");
    expect(args.weekStart).toBe("monday");
  });

  test("--highlight と --highlight-style", () => {
    const { args } = parseArgs([
      "--highlight",
      "2026-09-08",
      "--highlight-style",
      "reverse",
    ]);
    expect(args.highlight).toEqual(new Date(2026, 8, 8));
    expect(args.highlightStyle).toBe("reverse");
  });

  test("--help を返す", () => {
    const result = parseArgs(["--help"]);
    expect(result.help).toBe(true);
  });

  test("-h でも help", () => {
    expect(parseArgs(["-h"]).help).toBe(true);
  });

  test("不明なオプションはエラー", () => {
    const result = parseArgs(["--unknown"]);
    expect(result.error).toContain("Unknown option");
  });

  test("不正な引数はエラー", () => {
    const result = parseArgs(["abc"]);
    expect(result.error).toBeDefined();
  });

  test("負の年は Unknown option ではなく年範囲エラーになる", () => {
    const result = parseArgs(["-1"]);
    expect(result.error).toContain("Invalid year");
    expect(result.error).not.toContain("Unknown option");
  });

  test("負の月は Unknown option ではなく月範囲エラーになる", () => {
    const result = parseArgs(["2026", "-5"]);
    expect(result.error).toContain("Invalid month");
  });

  test("不正な --locale はエラー", () => {
    const result = parseArgs(["--locale", "xx"]);
    expect(result.error).toContain("Invalid locale");
  });

  test("追加ロケールを指定できる", () => {
    for (const locale of ["es", "de", "fr", "ko", "zh"] as const) {
      const { args } = parseArgs(["--locale", locale]);
      expect(args.locale).toBe(locale);
    }
  });

  test("不正な --week-start はエラー", () => {
    const result = parseArgs(["--week-start", "friday"]);
    expect(result.error).toContain("Invalid week-start");
  });

  test("不正な --theme はエラー", () => {
    const result = parseArgs(["--theme", "fancy"]);
    expect(result.error).toContain("Invalid theme");
  });

  test("不正な --highlight 日付はエラー", () => {
    const result = parseArgs(["--highlight", "2026-13-99"]);
    expect(result.error).toContain("Invalid --highlight");
  });

  test("空の --highlight はエラー", () => {
    const result = parseArgs(["--highlight", ""]);
    expect(result.error).toContain("Invalid --highlight");
  });

  test("値必須オプションが最後の引数だとエラー", () => {
    for (const opt of [
      "--theme",
      "--color-scheme",
      "--locale",
      "--week-start",
      "--highlight",
      "--highlight-style",
    ]) {
      const result = parseArgs([opt]);
      expect(result.error).toContain(`Missing value for option: ${opt}`);
    }
  });

  test("不正な --highlight-style はエラー", () => {
    const result = parseArgs(["--highlight-style", "blink"]);
    expect(result.error).toContain("Invalid highlight-style");
  });

  test("数値の範囲外はエラー (year)", () => {
    const result = parseArgs(["0"]);
    expect(result.error).toContain("Invalid year");
  });

  test("数値の範囲外はエラー (month)", () => {
    const result = parseArgs(["2026", "13"]);
    expect(result.error).toContain("Invalid month");
  });

  test("引数が多すぎる場合はエラー", () => {
    const result = parseArgs(["2026", "9", "15"]);
    expect(result.error).toContain("Too many arguments");
  });

  test("オプションと数値の混在", () => {
    const { args } = parseArgs(["2026", "--color", "9"]);
    expect(args.year).toBe(2026);
    expect(args.month).toBe(9);
    expect(args.color).toBe(true);
  });
});
