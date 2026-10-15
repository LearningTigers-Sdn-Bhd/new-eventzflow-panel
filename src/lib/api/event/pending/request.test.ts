import { describe, expect, test } from "bun:test";
import {
	approveTicketApplicationSchema,
	createPendingTicketSchema,
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

describe("createPendingTicketSchema quantity", () => {
	const base = {
		eventId: "1",
		attendee_name: "John Doe",
		ticket_type_id: 1,
	};

	test("defaults to no quantity (single ticket)", () => {
		expect(createPendingTicketSchema.safeParse(base).success).toBe(true);
	});

	test("accepts a positive integer quantity", () => {
		expect(
			createPendingTicketSchema.safeParse({ ...base, quantity: 5 }).success,
		).toBe(true);
	});

	test("rejects zero or negative quantity", () => {
		expect(
			createPendingTicketSchema.safeParse({ ...base, quantity: 0 }).success,
		).toBe(false);
		expect(
			createPendingTicketSchema.safeParse({ ...base, quantity: -1 }).success,
		).toBe(false);
	});

	test("rejects quantity above the 50 cap", () => {
		expect(
			createPendingTicketSchema.safeParse({ ...base, quantity: 51 }).success,
		).toBe(false);
	});
});
