import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const pageSource = readFileSync(
	new URL("./partner-analytics-page.tsx", import.meta.url),
	"utf8",
);
const statsCardSource = readFileSync(
	new URL("../../admin-ui/analytic/stats-card.tsx", import.meta.url),
	"utf8",
);

describe("Partner analytics breakdown table", () => {
	test("includes zone and shared table controls", () => {
		expect(pageSource).toContain('label: "Zone"');
		expect(pageSource).toContain("BaseTableControl");
		expect(pageSource).toContain("payment_status");
		expect(pageSource).toContain("Search package, zone...");
		expect(pageSource).toContain(
			'header: () => <div className="font-medium">Booth Type</div>',
		);
		expect(pageSource).toContain(
			'header: () => <div className="font-medium">Zone</div>',
		);
		expect(pageSource).not.toContain(
			'<SortableHeader column={column} label="Booth Pricing" />',
		);
		expect(pageSource).not.toContain(
			'<SortableHeader column={column} label="Zone" />',
		);
	});

	test("uses booth pricing as the desktop filter", () => {
		expect(pageSource).toContain("const boothPricingFilter");
		expect(pageSource).toContain('label: "Booth Pricing"');
		expect(pageSource).toContain("pricingLabels.length > 0");
		expect(pageSource).toContain("zones.length > 0");
		expect(pageSource).not.toContain('label: "Columns"');
		expect(pageSource).not.toContain('columnId: "visibility"');
	});

	test("keeps the page shell aligned and paginated", () => {
		expect(pageSource).toContain('className="w-full justify-start"');
		expect(pageSource).toContain('className="w-full text-left"');
		expect(pageSource).toContain('className="w-full justify-end"');
		expect(pageSource).toContain('className="w-full text-right"');
		expect(pageSource).toContain("<DataPagination table={table} />");
		expect(pageSource).not.toContain(
			"{data.length > 0 && <DataPagination table={table} />}",
		);
		const tableSection = pageSource.slice(
			pageSource.indexOf("function PartnerBreakdownTable"),
		);
		expect(tableSection.indexOf("<BaseTable")).toBeLessThan(
			tableSection.indexOf("<DataPagination table={table} />"),
		);
		expect(pageSource).not.toContain(
			"Review booth bookings, payment status, and sales by configured pricing.",
		);
	});

	test("renders the breakdown table without an outer card", () => {
		expect(pageSource).not.toContain('from "@/components/ui/card"');
		expect(pageSource).not.toContain("<Card className=");
		expect(pageSource).toContain("Booth Pricing Breakdown");
	});

	test("keeps analytics cards readable at desktop widths", () => {
		expect(pageSource).toContain(
			'className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5"',
		);
		expect(pageSource).toContain(
			'className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"',
		);
		expect(statsCardSource).toContain('className="min-w-0');
		expect(statsCardSource).toContain("break-words");
	});

	test("keeps the revenue guidance in the breakdown info banner", () => {
		expect(pageSource).toContain("<Info");
		expect(pageSource).toContain(
			"Sales are separated from visitor and participant analytics. Paid",
		);
		expect(pageSource).toContain(
			"status includes paid, waived, and sponsored kits. Waived and",
		);
		expect(pageSource).toContain(
			"sponsored kits do not add cash to Collected Revenue.",
		);
		expect(pageSource).not.toContain(
			'<p className="text-muted-foreground text-xs">\n\t\t\t\tPaid status includes',
		);
	});
});
