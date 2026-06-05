import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("WishesActionMenu", () => {
	test("confirms before deleting a wish", () => {
		const content = readFileSync(
			new URL("./action-menu.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("useConfirmDialog");
		expect(content).toContain("openConfirm(");
		expect(content).toContain("Delete Wish");
		expect(content).toContain("This action cannot be undone");
	});
});
