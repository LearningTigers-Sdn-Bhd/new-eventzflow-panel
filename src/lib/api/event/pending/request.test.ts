import { describe, expect, test } from "bun:test";
import {
	approveTicketApplicationSchema,
	rejectTicketApplicationSchema,
	resendTicketRsvpSchema,
} from "./request";

describe("pending ticket application action schemas", () => {
	test("accepts approve and resend payloads", () => {
		expect(
			approveTicketApplicationSchema.safeParse({
				eventId: "1",
				ticketId: "abc",
			}).success,
		).toBe(true);
		expect(
			resendTicketRsvpSchema.safeParse({ eventId: "1", ticketId: "abc" })
				.success,
		).toBe(true);
	});

	test("accepts rejection with optional reason", () => {
		const result = rejectTicketApplicationSchema.safeParse({
			eventId: "1",
			ticketId: "abc",
			reason: "Due to limited seats",
		});

		expect(result.success).toBe(true);
	});
});
