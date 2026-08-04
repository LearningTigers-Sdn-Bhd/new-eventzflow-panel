import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("ManualAddForm voucher support", () => {
	test("previews an optional exhibitor voucher per booth row", () => {
		const content = readFileSync(
			new URL("./manual-add-form.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("previewExhibitorVoucher");
		expect(content).toContain("Voucher Code (optional)");
		expect(content).toContain("Voucher applied — price becomes RM");
		expect(content).toContain("Invalid voucher code");
		expect(content).toContain("setTimeout(async () =>");
	});
});

describe("ManualAddForm multi-booth batch support", () => {
	test("uses the batch API helper with row state and idempotency", () => {
		const content = readFileSync(
			new URL("./manual-add-form.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("createEventVendorBatch");
		expect(content).toContain("boothRows");
		expect(content).toContain("Add Booth");
		expect(content).toContain("addBoothRow");
		expect(content).toContain("removeBoothRow");
		expect(content).toContain("hasDuplicateBoothNumbers");
		expect(content).toContain("crypto.randomUUID()");
	});
});
