<script lang="ts">
  import type { CalendarStateOptions } from "@typescript-calendar-lib/tui";
  import { useCalendarState } from "../src/useCalendarState.svelte.js";

  let {
    initialYear,
    initialMonth,
    today,
    highlight,
    range,
    locale,
    weekStart,
  }: {
    initialYear?: number;
    initialMonth?: number;
    today?: Date;
    highlight?: Date;
    range?: { from: Date; to: Date };
    locale?: CalendarStateOptions["locale"];
    weekStart?: CalendarStateOptions["weekStart"];
  } = $props();

  const cal = useCalendarState(() => ({
    initialYear,
    initialMonth,
    today,
    highlight,
    range,
    locale,
    weekStart,
  }));

  const rangeCount = () =>
    cal.state.monthData.cells.flat().filter((c) => c.isInRange).length;
  const todayCell = () =>
    cal.state.monthData.cells.flat().find((c) => c.isToday)?.day ?? "none";
</script>

<span data-testid="title">{cal.state.monthData.title}</span>
<span data-testid="cursor">{cal.cursorDate?.toISOString() ?? "null"}</span>
<span data-testid="selected">{cal.selectedDate?.toISOString() ?? "null"}</span>
<span data-testid="highlight">{cal.state.options.highlight?.toISOString() ?? "none"}</span>
<span data-testid="range-count">{rangeCount()}</span>
<span data-testid="today-cell">{String(todayCell())}</span>
<button type="button" data-testid="next" onclick={cal.goNext}>Next</button>
<button type="button" data-testid="prev" onclick={cal.goPrev}>Prev</button>
<button type="button" data-testid="today" onclick={cal.goToday}>Today</button>
<button type="button" data-testid="right" onclick={() => cal.moveCursor("right")}>Right</button>
<button type="button" data-testid="select" onclick={cal.selectDate}>Select</button>
<button type="button" data-testid="clear" onclick={cal.clearSelection}>Clear</button>