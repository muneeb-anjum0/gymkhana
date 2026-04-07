import { describe, expect, it } from "vitest";

import { formatShortDate, getWeekStart } from "./date";

describe("date helpers", () => {
  it("formats a short calendar date", () => {
    expect(formatShortDate("2024-04-07T12:00:00.000Z")).toBe("Apr 7, 2024");
  });

  it("returns the monday for a given week", () => {
    const weekStart = getWeekStart(new Date(2024, 3, 10, 12, 0, 0));

    expect(weekStart.getDay()).toBe(1);
    expect(weekStart.getDate()).toBe(8);
  });
});