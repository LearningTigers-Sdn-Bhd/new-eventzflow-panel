import { describe, expect, it } from "bun:test";
import {
	emailTypeLabel,
	needsAddressFix,
	problemReason,
} from "./email-status-labels";

describe("email status labels", () => {
	it("labels known and unknown email types", () => {
		expect(emailTypeLabel("confirmation_email")).toBe("Ticket confirmation");
		expect(emailTypeLabel("some_new_mail")).toBe("Some new mail");
	});

	it("explains problems in plain language", () => {
		expect(problemReason("bounced", null)).toContain("rejected");
		expect(problemReason("failed", "invalid_recipient")).toContain(
			"can't receive",
		);
		expect(problemReason("delivered", null)).toBeNull();
	});

	it("asks for an address fix only on bounces and suppressions", () => {
		expect(needsAddressFix("bounced")).toBe(true);
		expect(needsAddressFix("failed")).toBe(false);
	});
});
