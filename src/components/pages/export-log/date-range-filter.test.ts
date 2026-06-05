import { describe, expect, test } from "bun:test";
import { isWithinDateRange } from "./date-range-filter";

describe("isWithinDateRange", () => {
  const date = new Date("2026-05-15T10:00:00.000Z");

  test("returns true when no range set", () => {
    expect(isWithinDateRange(date, null, null)).toBe(true);
  });

  test("returns true when date equals from (same day)", () => {
    const from = new Date("2026-05-15T00:00:00.000Z");
    expect(isWithinDateRange(date, from, null)).toBe(true);
  });

  test("returns false when date is before from", () => {
    const from = new Date("2026-05-16T00:00:00.000Z");
    expect(isWithinDateRange(date, from, null)).toBe(false);
  });

  test("returns true when date equals to (end of day inclusive)", () => {
    const to = new Date("2026-05-15T00:00:00.000Z");
    expect(isWithinDateRange(date, null, to)).toBe(true);
  });

  test("returns false when date is after to end-of-day", () => {
    const to = new Date("2026-05-14T00:00:00.000Z");
    expect(isWithinDateRange(date, null, to)).toBe(false);
  });

  test("returns true when date is within range", () => {
    const from = new Date("2026-05-10T00:00:00.000Z");
    const to = new Date("2026-05-20T00:00:00.000Z");
    expect(isWithinDateRange(date, from, to)).toBe(true);
  });

  test("returns false when date is outside range", () => {
    const from = new Date("2026-05-01T00:00:00.000Z");
    const to = new Date("2026-05-10T00:00:00.000Z");
    expect(isWithinDateRange(date, from, to)).toBe(false);
  });
});
