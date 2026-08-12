import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("ExhibitorPageButton", () => {
	const content = readFileSync(
		new URL("./button.tsx", import.meta.url),
		"utf8",
	);

	test("renders the exhibitor import trigger under Exhibitor Settings", () => {
		expect(content).toContain("ExhibitorImportDialog");
		expect(content).toContain("../../event-vendors/exhibitor-import-dialog");
		expect(content).toContain("Import Exhibitors");
	});

	test("passes eventId and gates the trigger on exhibitor kits", () => {
		expect(content).toMatch(
			/<ExhibitorImportDialog\s+eventId={Number\(eventId\)}/,
		);
		expect(content).toContain("use_exhibitor_kit");
	});
});
