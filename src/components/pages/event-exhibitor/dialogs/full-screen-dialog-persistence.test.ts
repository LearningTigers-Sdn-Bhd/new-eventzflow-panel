import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const FULL_SCREEN_DIALOGS = [
	["booth-pricing-dialog.tsx", "booth-pricing-dialog"],
	["package-dialog.tsx", "package-dialog"],
	["voucher-dialog.tsx", "voucher-dialog"],
	["booth-inventory-dialog.tsx", "booth-inventory-dialog"],
] as const;

describe("full-screen exhibitor settings dialogs", () => {
	test.each(
		FULL_SCREEN_DIALOGS,
	)("%s keeps its open state across page remounts", (fileName, dialogKey) => {
		const source = readFileSync(new URL(fileName, import.meta.url), "utf8");

		expect(source).toContain(
			'import { useFullScreenDialogOpen } from "@/hooks/use-full-screen-dialog-open";',
		);
		expect(source).toContain(
			`useFullScreenDialogOpen(\n\t\t\`${dialogKey}-\${eventId}\`,\n\t)`,
		);
	});

	test("mounts full-screen dialogs outside the settings dropdown", () => {
		const source = readFileSync(
			new URL("../page-action/button.tsx", import.meta.url),
			"utf8",
		);
		const dropdownEnd = source.indexOf("</DropdownMenu>");

		expect(dropdownEnd).toBeGreaterThan(-1);
		for (const dialog of [
			"BoothPricingDialog",
			"PackageDialog",
			"VoucherDialog",
			"BoothInventoryDialog",
		]) {
			expect(source.indexOf(`<${dialog}`, dropdownEnd)).toBeGreaterThan(
				dropdownEnd,
			);
		}
	});
});
