import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("VoucherDialog", () => {
	test("supports creating, listing, and deleting exhibitor vouchers", () => {
		const content = readFileSync(
			new URL("./voucher-dialog.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("Manage Exhibitor Vouchers");
		expect(content).toContain("createExhibitorVoucher");
		expect(content).toContain("deleteExhibitorVoucher");
		expect(content).toContain('["exhibitor-vouchers", eventId]');
		expect(content).toContain("Already redeemed");
		expect(content).toContain("Delete voucher");
		expect(content).toContain("font-mono");
		expect(content).toContain("Flat RM");
	});

	test("is available between Packages and Manage Booths", () => {
		const content = readFileSync(
			new URL("../page-action/button.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("VoucherDialog");
		expect(content).toContain("Vouchers");
		expect(content.indexOf("Packages")).toBeLessThan(
			content.indexOf("Vouchers"),
		);
		expect(content.indexOf("Vouchers")).toBeLessThan(
			content.indexOf("Manage Booths"),
		);
	});

	test("uses the fullscreen settings workspace", () => {
		const content = readFileSync(
			new URL("./voucher-dialog.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("h-[100dvh]");
		expect(content).toContain("w-screen");
		expect(content).toContain("lg:w-[420px]");
	});
});
