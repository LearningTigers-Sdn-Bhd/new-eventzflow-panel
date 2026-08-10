import { describe, expect, test } from "bun:test";
import { getExhibitorFilterOptions } from "./filter-options";

describe("event exhibitor filter options", () => {
	test("keeps configured booth prices and zones even when no exhibitor uses them", () => {
		expect(
			getExhibitorFilterOptions(
				[
					{ boothPricingLabel: "Booked Booth", zone: "Zone A" },
					{ boothPricingLabel: null, zone: null },
				],
				["Unused Booth"],
				["Zone A", "Zone B"],
			),
		).toEqual({
			pricingLabels: ["Booked Booth", "Unused Booth"],
			zones: ["Zone A", "Zone B"],
			hasUnassignedZone: true,
		});
	});
});
