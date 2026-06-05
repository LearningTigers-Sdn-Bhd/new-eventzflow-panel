import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("CustomRequestsPage", () => {
	test("uses the shared auto refresh query helper", () => {
		const content = readFileSync(
			new URL("./custom-requests-page.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("getAutoRefreshQueryOptions");
	});
});
