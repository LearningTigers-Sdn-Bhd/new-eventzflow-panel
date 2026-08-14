import { describe, expect, test } from "bun:test";
import {
	formatAvailabilityDate,
	isAvailableDate,
	parseAvailabilityDate,
} from "./business-matching-dates";

describe("business matching availability dates", () => {
	test("formats without padding the day, matching the API's %-d %B %Y", () => {
		expect(formatAvailabilityDate(new Date(2026, 7, 5))).toBe("5 August 2026");
		expect(formatAvailabilityDate(new Date(2026, 7, 15))).toBe("15 August 2026");
	});

	test("parses the API format back to the same calendar day", () => {
		const parsed = parseAvailabilityDate("5 August 2026");
		expect(parsed?.getFullYear()).toBe(2026);
		expect(parsed?.getMonth()).toBe(7);
		expect(parsed?.getDate()).toBe(5);
	});

	test("falls back to ISO input", () => {
		expect(parseAvailabilityDate("2026-08-05")?.getDate()).toBe(5);
	});

	test("returns null for junk rather than an Invalid Date", () => {
		expect(parseAvailabilityDate("not a date")).toBeNull();
	});

	// The regression: a zero-padded string comparison ("05 August 2026" vs the
	// API's "5 August 2026") disabled every single-digit day in the calendar.
	test("matches single-digit days the old string comparison missed", () => {
		const dates = [{ date: "5 August 2026" }, { date: "15 August 2026" }];

		expect(isAvailableDate(new Date(2026, 7, 5), dates)).toBe(true);
		expect(isAvailableDate(new Date(2026, 7, 15), dates)).toBe(true);
		expect(isAvailableDate(new Date(2026, 7, 6), dates)).toBe(false);
	});

	test("is false when there are no dates at all", () => {
		expect(isAvailableDate(new Date(2026, 7, 5), undefined)).toBe(false);
		expect(isAvailableDate(new Date(2026, 7, 5), [])).toBe(false);
	});
});
