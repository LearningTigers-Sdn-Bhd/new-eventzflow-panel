import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("WishesModeration", () => {
	test("renders an auto approve toggle wired to event data", () => {
		const content = readFileSync(
			new URL("./wishes-moderation.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("Auto-approve wishes");
		expect(content).toContain("auto_approve_wishes");
		expect(content).toContain("updateEvent(eventId");
		expect(content).toContain("Switch");
	});

	test("auto refreshes the moderation list on an interval", () => {
		const content = readFileSync(
			new URL("./wishes-moderation.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("getAutoRefreshQueryOptions");
	});

	test("renders a configuration dropdown for wishes wall actions", () => {
		const content = readFileSync(
			new URL("./wishes-moderation.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("Configuration");
		expect(content).toContain("DropdownMenu");
		expect(content).toContain("DropdownMenuItem");
		expect(content).toContain("Open Form");
		expect(content).toContain("Wall Configuration");
		expect(content).toContain("Live Wall");
		expect(content).toContain("WishWallSettingsDialogContent");
		expect(content).toContain("openDialog({");
		expect(content).toContain('size: "full"');
	});
});
