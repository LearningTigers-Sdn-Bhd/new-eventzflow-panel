import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("exhibitor kit import endpoints", () => {
	const endpointsSource = readFileSync(
		new URL("./endpoints.ts", import.meta.url),
		"utf8",
	);
	const responseSource = readFileSync(
		new URL("./response.ts", import.meta.url),
		"utf8",
	);

	test("exports downloadExhibitorKitImportTemplate hitting the import_template route", () => {
		expect(endpointsSource).toContain(
			"export async function downloadExhibitorKitImportTemplate",
		);
		expect(endpointsSource).toContain("/exhibitor_kits/import_template");
	});

	test("exports importExhibitorKits hitting the import route via postFormData", () => {
		expect(endpointsSource).toContain(
			"export async function importExhibitorKits",
		);
		expect(endpointsSource).toContain("postFormData");
		expect(endpointsSource).toContain("/exhibitor_kits/import");
	});

	test("importExhibitorKits does not unwrap a .data envelope", () => {
		// This endpoint's backend response has no `data` key (unlike ticket import) —
		// the response type is consumed directly, not via `response.data`.
		const fnMatch = endpointsSource.match(
			/export async function importExhibitorKits[\s\S]*?\n}\n/,
		);
		expect(fnMatch).not.toBeNull();
		expect(fnMatch?.[0]).not.toContain(".data");
	});

	test("response.ts defines ImportExhibitorKitsResponse with total/created/skipped/errors", () => {
		expect(responseSource).toContain(
			"export interface ImportExhibitorKitsResponse",
		);
		expect(responseSource).toContain("total: number");
		expect(responseSource).toContain("created:");
		expect(responseSource).toContain("skipped:");
		expect(responseSource).toContain("errors:");
	});
});
