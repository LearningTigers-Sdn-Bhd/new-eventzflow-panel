import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("fascia validation limits", () => {
	test("panel request schemas allow up to 30 characters for fascia names", () => {
		const exhibitorKitRequest = readFileSync(
			new URL("./request.ts", import.meta.url),
			"utf8",
		);
		const eventVendorRequest = readFileSync(
			new URL("../event-vendor/request.ts", import.meta.url),
			"utf8",
		);
		const vendorInvitationRequest = readFileSync(
			new URL("../vendor-invitation/request.ts", import.meta.url),
			"utf8",
		);

		expect(exhibitorKitRequest).toContain("30 characters or less");
		expect(exhibitorKitRequest).toContain(".max(30");
		expect(eventVendorRequest).toContain(".max(30");
		expect(vendorInvitationRequest).toContain("Max 30 characters");
	});
});
