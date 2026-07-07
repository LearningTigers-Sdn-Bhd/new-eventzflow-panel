import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("TicketViewModal payment info layout", () => {
	test("uses wider responsive layout and payment info flag", () => {
		const content = readFileSync(
			new URL("./event-ticket-view-modal.tsx", import.meta.url),
			"utf8",
		);
		const actionMenuContent = readFileSync(
			new URL("../event-ticket-action-menu.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("const hasPaymentInfo = Boolean(");
		expect(content).toContain("max-w-6xl");
		expect(content).toContain(
			'hasPaymentInfo ? "lg:grid-cols-3" : "md:grid-cols-2"',
		);
		expect(content).toContain("{hasPaymentInfo && (");
		expect(content).toContain('target="_blank"');
		expect(content).toContain('rel="noopener noreferrer"');
		expect(actionMenuContent).toContain('size: "4xl"');
	});
});
