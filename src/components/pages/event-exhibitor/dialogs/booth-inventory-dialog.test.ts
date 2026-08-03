import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("BoothInventoryDialog", () => {
	test("exposes manual, range, paste, filtering, and row actions", () => {
		const content = readFileSync(
			new URL("./booth-inventory-dialog.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("Manage Exhibitor Booths");
		expect(content).toContain("Add booth");
		expect(content).toContain("Generate range");
		expect(content).toContain("Paste numbers");
		expect(content).toContain("Release");
		expect(content).toContain("Nothing was created");
	});

	test("is available from Exhibitor Settings", () => {
		const content = readFileSync(
			new URL("../page-action/button.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("BoothInventoryDialog");
		expect(content).toContain("Manage Booths");
		expect(content).toContain("Vault");
		expect(content).not.toContain("Armchair");
	});

	test("uses a fullscreen workspace with a stable sidebar and compact filters", () => {
		const content = readFileSync(
			new URL("./booth-inventory-dialog.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("h-[100dvh]");
		expect(content).toContain("w-screen");
		expect(content).toContain("grid-cols-[400px_minmax(0,1fr)]");
		expect(content).toContain("flex flex-wrap");
		expect(content).not.toContain("h-[92vh]");
	});
});
