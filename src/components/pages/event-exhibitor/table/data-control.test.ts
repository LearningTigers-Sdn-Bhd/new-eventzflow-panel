import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const dataControlSource = readFileSync(
	new URL("./data-control.tsx", import.meta.url),
	"utf8",
);
const columnsSource = readFileSync(
	new URL("./columns.tsx", import.meta.url),
	"utf8",
);

describe("event exhibitor table filters", () => {
	test("provides conditional booth pricing and zone filters", () => {
		expect(dataControlSource).toContain('"Booth Pricing"');
		expect(dataControlSource).toContain('"Zone"');
		expect(dataControlSource).toContain("pricingLabels.length > 0");
		expect(dataControlSource).toContain("zones.length > 0");
		expect(dataControlSource).toContain("exhibitor_booth_price_label");
		expect(dataControlSource).toContain("exhibitor_booth_price_zone");
	});

	test("includes configured catalog options in the filters", () => {
		expect(dataControlSource).toContain("configuredPricingLabels");
		expect(dataControlSource).toContain("configuredZones");
		expect(dataControlSource).toContain("getExhibitorFilterOptions");
	});

	test("keeps filter-only columns hidden from the table", () => {
		expect(columnsSource).toContain('id: "booth_pricing"');
		expect(columnsSource).toContain('id: "zone"');
		expect(columnsSource).toContain("enableHiding: false");
	});
});
