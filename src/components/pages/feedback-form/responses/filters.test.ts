import { describe, expect, test } from "bun:test";
import { format } from "date-fns";
import {
	DEFAULT_FILTERS,
	filtersKey,
	hasActiveFilters,
	ISO_DATE,
	parseIsoDate,
} from "./filters";

describe("date filters", () => {
	test("parses YYYY-MM-DD as that local day, with no timezone shift", () => {
		const date = parseIsoDate("2026-03-28");
		expect(date?.getFullYear()).toBe(2026);
		expect(date?.getMonth()).toBe(2);
		expect(date?.getDate()).toBe(28);
		expect(format(date as Date, ISO_DATE)).toBe("2026-03-28");
	});

	test("round-trips month and year ends", () => {
		for (const value of ["2026-01-01", "2026-12-31", "2028-02-29"]) {
			expect(format(parseIsoDate(value) as Date, ISO_DATE)).toBe(value);
		}
	});

	test("empty or invalid values mean no date", () => {
		expect(parseIsoDate("")).toBeUndefined();
		expect(parseIsoDate(undefined)).toBeUndefined();
		expect(parseIsoDate("not a date")).toBeUndefined();
		expect(parseIsoDate("2026-02-30")).toBeUndefined();
	});
});

describe("filter state", () => {
	test("defaults are inactive; any filter makes it active", () => {
		expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
		expect(hasActiveFilters({ ...DEFAULT_FILTERS, ticketTypeId: "5" })).toBe(
			true,
		);
		expect(hasActiveFilters({ ...DEFAULT_FILTERS, from: "2026-03-01" })).toBe(
			true,
		);
		expect(hasActiveFilters({ ...DEFAULT_FILTERS, to: "2026-03-31" })).toBe(
			true,
		);
	});

	test("query key changes with each filter", () => {
		expect(filtersKey({ ticketTypeId: "all", from: "", to: "" })).toEqual([
			"all",
			"",
			"",
		]);
		expect(filtersKey({ ticketTypeId: "2", from: "a", to: "b" })).toEqual([
			"2",
			"a",
			"b",
		]);
	});
});
