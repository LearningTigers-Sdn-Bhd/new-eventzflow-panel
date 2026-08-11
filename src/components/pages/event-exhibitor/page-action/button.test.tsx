import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("ExhibitorPageButton", () => {
	const content = readFileSync(
		new URL("./button.tsx", import.meta.url),
		"utf8",
	);

	test("renders the exhibitor import trigger on the Exhibitor page", () => {
		expect(content).toContain("ExhibitorImportButton");
		expect(content).toContain("../../event-vendors/exhibitor-import-dialog");
	});

	test("passes eventId and gates the trigger on exhibitor kits", () => {
		expect(content).toMatch(
			/<ExhibitorImportButton\s+eventId={Number\(eventId\)}/,
		);
		expect(content).toContain("use_exhibitor_kit");
	});
});
