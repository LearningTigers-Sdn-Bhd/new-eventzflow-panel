import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("exhibitor management toggle wiring", () => {
	test("create and edit forms include enable exhibitor management field", () => {
		const createForm = readFileSync(
			new URL("./create-event-form.tsx", import.meta.url),
			"utf8",
		);
		const editForm = readFileSync(
			new URL("./settings/edit-info-form.tsx", import.meta.url),
			"utf8",
		);

		expect(createForm).toContain('name="enableExhibitorManagement"');
		expect(editForm).toContain('name="enableExhibitorManagement"');
		expect(createForm).toContain("Enable Exhibitor Management");
		expect(editForm).toContain("Enable Exhibitor Management");
	});
});
