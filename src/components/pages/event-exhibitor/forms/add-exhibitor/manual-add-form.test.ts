import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("ManualAddForm voucher support", () => {
	test("previews and submits an optional exhibitor voucher", () => {
		const content = readFileSync(
			new URL("./manual-add-form.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("previewExhibitorVoucher");
		expect(content).toContain("Voucher Code (optional)");
		expect(content).toContain("Voucher applied — price becomes RM");
		expect(content).toContain("Invalid voucher code");
		expect(content).toContain("kit.voucher_code = voucherCode.trim()");
		expect(content).toContain("setTimeout(async () =>");
	});
});
