import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("event multi-ticket-per-email setting", () => {
	test("wires the admin toggle through hydration and update payload", () => {
		const source = readFileSync(
			new URL("./edit-info-form.tsx", import.meta.url),
			"utf8",
		);

		expect(source).toContain('name="allowMultipleTicketsPerEmail"');
		expect(source).toContain("Allow multiple tickets per email");
		expect(source).toContain(
			"One person can hold more than one ticket for this event.",
		);
		expect(source).toContain(
			"allow_multiple_tickets_per_email: value.allowMultipleTicketsPerEmail",
		);
		expect(source).toContain('"allowMultipleTicketsPerEmail",');
		expect(source).toContain(
			"event.allow_multiple_tickets_per_email ?? false,",
		);
		const registrationSource = readFileSync(
			new URL(
				"../../public-registration/PublicRegistrationForm.tsx",
				import.meta.url,
			),
			"utf8",
		);
		expect(registrationSource).toContain(
			"required={index === 0 || !allowMultipleTicketsPerEmail}",
		);
	});
});
