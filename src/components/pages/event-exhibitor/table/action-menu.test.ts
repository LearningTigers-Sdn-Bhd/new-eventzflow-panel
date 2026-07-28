import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

test("row deletion targets only the selected exhibitor kit", () => {
	const source = readFileSync(
		new URL("./action-menu.tsx", import.meta.url),
		"utf8",
	);

	expect(source).toContain("deleteExhibitorKit(Number(eventId), kitId)");
	expect(source).toContain('title: "Cancel Exhibitor Kit"');
	expect(source).toContain("Cancel Kit");
	expect(source).not.toContain("deleteEventVendor");
});

test("vendor account removal remains separate and explicitly labelled", () => {
	const source = readFileSync(
		new URL(
			"../../event-vendors/table/event-vendor-action-menu.tsx",
			import.meta.url,
		),
		"utf8",
	);

	expect(source).toContain('title: "Remove Vendor Account from Event"');
	expect(source).toContain("Remove Vendor Account");
});
