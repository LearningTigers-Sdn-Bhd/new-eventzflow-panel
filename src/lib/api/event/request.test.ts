import { describe, expect, test } from "bun:test";
import { createEventSchema, updateEventSchema } from "./request";

describe("event multi-ticket-per-email request fields", () => {
	test("defaults create requests to disabled", () => {
		const result = createEventSchema.parse({
			title: "Example Event",
			start_date: "2026-08-17T09:00:00.000Z",
			end_date: "2026-08-17T10:00:00.000Z",
		});

		expect(result.allow_multiple_tickets_per_email).toBe(false);
	});

	test("accepts the flag on update requests", () => {
		const result = updateEventSchema.safeParse({
			allow_multiple_tickets_per_email: true,
		});

		expect(result.success).toBe(true);
	});
});
