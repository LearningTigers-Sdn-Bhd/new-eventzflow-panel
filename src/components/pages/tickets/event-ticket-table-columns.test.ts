import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("event ticket conferences included column", () => {
	test("renders conferences_included as capitalized red and green badges with a wider column", () => {
		const content = readFileSync(
			new URL("./event-ticket-table-columns.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain('key === "conferences_included"');
		expect(content).toContain('{isIncluded ? "True" : "False"}');
		expect(content).toContain("border-green-200");
		expect(content).toContain("text-green-800");
		expect(content).toContain("border-red-200");
		expect(content).toContain("text-red-800");
		expect(content).toContain("size: key === \"conferences_included\" ? 220 : 180");
	});
});
