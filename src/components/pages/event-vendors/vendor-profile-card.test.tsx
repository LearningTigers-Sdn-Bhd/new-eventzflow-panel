import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("VendorProfileCard category badge", () => {
	test("renders category as a readable row below the marketing subtitle", () => {
		const content = readFileSync(
			new URL("./vendor-profile-card.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("Category:");
		expect(content).toContain("border-t border-dashed");
		expect(content).toContain("text-sm");
		expect(content).not.toContain("line-clamp-2");
		expect(content).not.toContain("break-all");
	});
});
