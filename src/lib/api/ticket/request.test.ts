import { describe, expect, test } from "bun:test";
import { createTicketSchema } from "./request";

describe("createTicketSchema quantity", () => {
	const base = {
		eventId: "1",
		attendee_name: "John Doe",
		ticket_type_id: 1,
	};

	test("defaults to no quantity (single ticket)", () => {
		expect(createTicketSchema.safeParse(base).success).toBe(true);
	});

	test("accepts a positive integer quantity", () => {
		expect(createTicketSchema.safeParse({ ...base, quantity: 5 }).success).toBe(
			true,
		);
	});

	test("rejects zero or negative quantity", () => {
		expect(createTicketSchema.safeParse({ ...base, quantity: 0 }).success).toBe(
			false,
		);
		expect(
			createTicketSchema.safeParse({ ...base, quantity: -1 }).success,
		).toBe(false);
	});

	test("rejects quantity above the 50 cap", () => {
		expect(
			createTicketSchema.safeParse({ ...base, quantity: 51 }).success,
		).toBe(false);
	});
});
