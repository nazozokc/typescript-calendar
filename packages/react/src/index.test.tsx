import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { useCalendarState } from "./hooks.ts";
import { Calendar } from "./index.tsx";
import { isSizeName } from "./size.ts";

const TODAY = new Date(2026, 8, 15); // 2026-09-15

afterEach(cleanup);

// ─── useCalendarState hook ──────────────────────────────

function HookTestComponent() {
  const {
    state,
    goNext,
    goPrev,
    goToday,
    moveCursor,
    selectDate,
    cursorDate,
    selectedDate,
  } = useCalendarState({
    initialYear: 2026,
    initialMonth: 9,
    today: TODAY,
  });

  return createElement(
    "div",
    null,
    createElement("span", { "data-testid": "title" }, state.monthData.title),
    createElement(
      "span",
      { "data-testid": "cursor" },
      cursorDate?.toISOString() ?? "null",
    ),
    createElement(
      "span",
      { "data-testid": "selected" },
      selectedDate?.toISOString() ?? "null",
    ),
    createElement(
      "button",
      { "data-testid": "next", type: "button", onClick: goNext },
      "Next",
    ),
    createElement(
      "button",
      { "data-testid": "prev", type: "button", onClick: goPrev },
      "Prev",
    ),
    createElement(
      "button",
      { "data-testid": "today", type: "button", onClick: goToday },
      "Today",
    ),
    createElement(
      "button",
      {
        "data-testid": "right",
        type: "button",
        onClick: () => moveCursor("right"),
      },
      "Right",
    ),
    createElement(
      "button",
      { "data-testid": "select", type: "button", onClick: selectDate },
      "Select",
    ),
  );
}

describe("useCalendarState", () => {
  test("初期状態は指定月を表示", () => {
    render(createElement(HookTestComponent));
    expect(screen.getByTestId("title").textContent).toBe("September 2026");
  });

  test("カーソルは今日の日付を指す", () => {
    render(createElement(HookTestComponent));
    expect(screen.getByTestId("cursor").textContent).toBe(TODAY.toISOString());
  });

  test("翌月に移動できる", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("next"));
    expect(screen.getByTestId("title").textContent).toBe("October 2026");
  });

  test("前月に移動できる", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("prev"));
    expect(screen.getByTestId("title").textContent).toBe("August 2026");
  });

  test("今日にジャンプできる", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("next"));
    fireEvent.click(screen.getByTestId("next"));
    fireEvent.click(screen.getByTestId("today"));
    expect(screen.getByTestId("title").textContent).toBe("September 2026");
  });

  test("カーソルを右に動かせる", () => {
    render(createElement(HookTestComponent));
    const before = screen.getByTestId("cursor").textContent;
    fireEvent.click(screen.getByTestId("right"));
    const after = screen.getByTestId("cursor").textContent;
    expect(after).not.toBe(before);
  });

  test("日付を選択できる", () => {
    render(createElement(HookTestComponent));
    fireEvent.click(screen.getByTestId("select"));
    expect(screen.getByTestId("selected").textContent).toBe(
      TODAY.toISOString(),
    );
  });
});

// ─── Calendar component interaction ─────────────────────

describe("Calendar interactive", () => {
  test("interactive モードではセル内に button がレンダリングされる", () => {
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
      }),
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    // テーブルセルのセマンティクスを保つため button は td の内側にある
    expect(buttons[0]!.closest("td")).not.toBeNull();
  });

  test("interactive でない場合は button がない", () => {
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        today: TODAY,
      }),
    );
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  test("セルクリックで onDateClick が呼ばれる", () => {
    const onClick = vi.fn();
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        onDateClick: onClick,
      }),
    );
    const cells = screen.getAllByRole("button");
    fireEvent.click(cells[0]!);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]![0]).toBeInstanceOf(Date);
  });

  test("セルホバーで onDateHover が呼ばれる", () => {
    const onHover = vi.fn();
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        onDateHover: onHover,
      }),
    );
    const cells = screen.getAllByRole("button");
    fireEvent.mouseEnter(cells[0]!);
    expect(onHover).toHaveBeenCalledTimes(1);
  });

  test("Enter キーで onDateClick が呼ばれる", () => {
    const onClick = vi.fn();
    render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
        onDateClick: onClick,
      }),
    );
    const cells = screen.getAllByRole("button");
    cells[0]!.focus();
    // 実ブラウザではフォーカス中の button への Enter は click を発火する。
    // jsdom はこの既定動作を実装していないため、keyDown 後の click で再現する。
    fireEvent.keyDown(cells[0]!, { key: "Enter" });
    fireEvent.click(cells[0]!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("interactive モードで calendar-interactive クラスがつく", () => {
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        interactive: true,
        today: TODAY,
      }),
    );
    expect(container.firstChild).toHaveClass("calendar-interactive");
  });
});

// ─── useCalendarState options 更新 ─────────────────────

describe("useCalendarState options 更新", () => {
  test("highlight の変更が状態に反映される", () => {
    function Capture({ highlight }: { highlight?: Date }) {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        highlight,
      });
      return createElement(
        "span",
        { "data-testid": "highlight" },
        state.options.highlight?.toISOString() ?? "none",
      );
    }
    const first = new Date(2026, 8, 10);
    const { rerender } = render(createElement(Capture, { highlight: first }));
    expect(screen.getByTestId("highlight").textContent).toBe(
      first.toISOString(),
    );

    const next = new Date(2026, 8, 11);
    rerender(createElement(Capture, { highlight: next }));
    expect(screen.getByTestId("highlight").textContent).toBe(
      next.toISOString(),
    );
  });

  test("同じ値の options で再レンダリングしても状態は再構築されない", () => {
    const observed: unknown[] = [];
    let highlight: Date | undefined = new Date(2026, 8, 10);
    function Capture() {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        highlight,
      });
      observed.push(state);
      return null;
    }
    const { rerender } = render(createElement(Capture));
    // 新しいインスタンスだが同じ時刻 → 再構築されず state 参照が維持される
    highlight = new Date(2026, 8, 10);
    rerender(createElement(Capture));
    expect(observed[1]).toBe(observed[0]);
  });

  test("値が変わると状態が再構築される", () => {
    const observed: unknown[] = [];
    let highlight: Date | undefined = new Date(2026, 8, 10);
    function Capture() {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        highlight,
      });
      observed.push(state);
      return null;
    }
    const { rerender } = render(createElement(Capture));
    highlight = new Date(2026, 8, 11);
    rerender(createElement(Capture));
    // effect 後の再レンダリングで新 state が生成される
    expect(observed.at(-1)).not.toBe(observed[0]);
  });

  test("range の変更が状態に反映される", () => {
    function Capture({ range }: { range?: { from: Date; to: Date } }) {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        range,
      });
      const count = state.monthData.cells
        .flat()
        .filter((c) => c.isInRange).length;
      return createElement("span", { "data-testid": "count" }, String(count));
    }
    const { rerender } = render(
      createElement(Capture, {
        range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 15) },
      }),
    );
    expect(screen.getByTestId("count").textContent).toBe("15");

    rerender(
      createElement(Capture, {
        range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 10) },
      }),
    );
    expect(screen.getByTestId("count").textContent).toBe("10");
  });

  test("today の変更が状態に反映される", () => {
    function Capture({ today }: { today: Date }) {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 9,
        today,
      });
      const todayCell = state.monthData.cells.flat().find((c) => c.isToday);
      return createElement(
        "span",
        { "data-testid": "today" },
        String(todayCell?.day ?? "none"),
      );
    }
    const { rerender } = render(createElement(Capture, { today: TODAY }));
    expect(screen.getByTestId("today").textContent).toBe("15");

    rerender(createElement(Capture, { today: new Date(2026, 8, 20) }));
    expect(screen.getByTestId("today").textContent).toBe("20");
  });

  test("ナビゲーション後に options を変更しても表示月が初期値に戻らない", () => {
    let highlight: Date | undefined;
    function Capture() {
      const { state, goNext } = useCalendarState({
        initialYear: 2026,
        initialMonth: 9,
        today: TODAY,
        highlight,
      });
      const title = state.monthData.title;
      return createElement(
        "button",
        { type: "button", onClick: goNext, "data-testid": "title" },
        String(title),
      );
    }
    const { rerender } = render(createElement(Capture));
    fireEvent.click(screen.getByTestId("title"));
    expect(screen.getByTestId("title").textContent).toBe("October 2026");

    // highlight の変更は表示月を September に引き戻さない
    highlight = new Date(2026, 8, 10);
    rerender(createElement(Capture));
    expect(screen.getByTestId("title").textContent).toBe("October 2026");
  });

  test("initialMonth が範囲外でも options 更新後に state と monthData が乖離しない", () => {
    function Capture() {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 13,
        today: TODAY,
      });
      return createElement(
        "span",
        { "data-testid": "ym" },
        `${state.year}-${state.month} ${state.monthData.title}`,
      );
    }
    const { rerender } = render(createElement(Capture));
    // 初期表示は正規化後の 2027-01
    expect(screen.getByTestId("ym").textContent).toContain(
      "2027-1 January 2027",
    );

    // 別オプション（locale）の変更で再構築されても正規化済みの位置を維持する
    function CaptureJa() {
      const { state } = useCalendarState({
        initialYear: 2026,
        initialMonth: 13,
        today: TODAY,
        locale: "ja",
      });
      return createElement(
        "span",
        { "data-testid": "ym" },
        `${state.year}-${state.month} ${state.monthData.title}`,
      );
    }
    rerender(createElement(CaptureJa));
    expect(screen.getByTestId("ym").textContent).toContain("2027-1");
    expect(screen.getByTestId("ym").textContent).toContain("1月 2027");
    expect(screen.getByTestId("ym").textContent).not.toContain("2026-13");
  });
});

// ─── Calendar の堅牢性 ─────────────────────────────────

describe("Calendar の入力検証・正規化", () => {
  test("逆転した range は RangeError", () => {
    expect(() =>
      render(
        createElement(Calendar, {
          year: 2026,
          month: 9,
          range: { from: new Date(2026, 8, 15), to: new Date(2026, 8, 1) },
        }),
      ),
    ).toThrow(RangeError);
  });

  test("範囲外の month は RangeError（fail fast）", () => {
    expect(() =>
      render(createElement(Calendar, { year: 2026, month: 0 })),
    ).toThrow(RangeError);
  });

  test("isSizeName は組み込みサイズ名のみ true", () => {
    expect(isSizeName("sm")).toBe(true);
    expect(isSizeName("md")).toBe(true);
    expect(isSizeName("lg")).toBe(true);
    expect(isSizeName("xl" as never)).toBe(false);
    expect(isSizeName({ width: 48 })).toBe(false);
  });

  test("未知のサイズ名文字列でもクラッシュしない", () => {
    const { container } = render(
      createElement(Calendar, {
        year: 2026,
        month: 9,
        size: "xl" as never,
      }),
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).not.toContain("calendar-size");
    expect(root.querySelectorAll("td")).not.toHaveLength(0);
  });
});
