import { describe, expect, test } from "bun:test";
import { formatDateRange } from "./date-utils";

describe("formatDateRange", () => {
	test("returns a single dd/mm/yyyy date when start and end are the same day", () => {
		expect(
			formatDateRange("2026-03-27T00:00:00.000Z", "2026-03-27T23:59:59.000Z"),
		).toBe("27/03/2026");
	});

	test("returns a dd/mm/yyyy range when start and end are different days", () => {
		expect(
			formatDateRange("2026-03-27T00:00:00.000Z", "2026-03-28T00:00:00.000Z"),
		).toBe("27/03/2026 - 28/03/2026");
	});
});
