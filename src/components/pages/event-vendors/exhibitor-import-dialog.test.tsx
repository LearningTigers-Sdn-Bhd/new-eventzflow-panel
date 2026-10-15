import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("ExhibitorImportDialog", () => {
	const content = readFileSync(
		new URL("./exhibitor-import-dialog.tsx", import.meta.url),
		"utf8",
	);

	test("exports ExhibitorImportDialog with a customizable trigger", () => {
		expect(content).toContain("export function ExhibitorImportDialog");
		expect(content).toContain("trigger?: React.ReactNode");
	});

	test("offers a template download action", () => {
		expect(content).toContain("downloadExhibitorKitImportTemplate");
	});

	test("only accepts .xlsx uploads, not .csv/.xls like the ticket importer", () => {
		expect(content).toContain(
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		);
		expect(content).not.toContain(".csv");
	});

	test("supports a dry-run toggle", () => {
		expect(content).toContain("dryRun");
	});

	test("uses importExhibitorKits, not the ticket importTickets function", () => {
		expect(content).toContain("importExhibitorKits");
		expect(content).not.toContain("importTickets(");
	});
});
