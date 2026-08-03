import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

test("deletes an exact kit through the nested backend endpoint", () => {
	const source = readFileSync(
		new URL("./endpoints.ts", import.meta.url),
		"utf8",
	);

	expect(source).toContain("export async function deleteExhibitorKit(");
	expect(source).toMatch(
		/`v1\/events\/\$\{eventId\}\/exhibitor_kits\/\$\{kitId\}`/,
	);
});
