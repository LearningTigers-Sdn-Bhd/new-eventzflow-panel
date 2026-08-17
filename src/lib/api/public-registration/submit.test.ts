import { describe, expect, mock, test } from "bun:test";

const registrationPayloads: Array<Record<string, unknown>> = [];

mock.module("./endpoints", () => ({
	createPublicRegistration: async (
		_eventSlug: string,
		payload: Record<string, unknown>,
	) => {
		registrationPayloads.push(payload);
		return {
			public_id: `ticket-${registrationPayloads.length}`,
			payment_status: "paid",
			status: "purchased",
		};
	},
}));

describe("public registration submit", () => {
	test("inherits blank name and email from seat one without copying custom fields", async () => {
		registrationPayloads.length = 0;
		const { submitGroupRegistrations } = await import("./submit");

		await submitGroupRegistrations({
			eventSlug: "event-slug",
			ticketTypeId: 42,
			registeredByEmail: "buyer@example.com",
			concurrency: 1,
			attendees: [
				{
					attendee_name: "Seat One",
					attendee_email: "buyer@example.com",
					custom_fields_data: { ic_passport_no: "P1" },
				},
				{
					attendee_name: "",
					attendee_email: "",
					custom_fields_data: { ic_passport_no: "P2" },
				},
			],
		});

		expect(registrationPayloads).toHaveLength(2);
		expect(registrationPayloads[1]).toMatchObject({
			attendee_name: "Seat One",
			attendee_email: "buyer@example.com",
			custom_fields_data: { ic_passport_no: "P2" },
		});
		expect(registrationPayloads[1].custom_fields_data).not.toEqual(
			expect.objectContaining({ ic_passport_no: "P1" }),
		);
	});
});
