import { describe, expect, test } from "bun:test";
import {
	getRegistrationFormRsvpSettingSchema,
	updateRegistrationFormRsvpSettingSchema,
} from "./request";

describe("registration form RSVP setting request schema", () => {
	test("accepts valid get payload", () => {
		const parsed = getRegistrationFormRsvpSettingSchema.safeParse({
			eventId: "12",
			registrationFormId: "9",
		});
		expect(parsed.success).toBe(true);
	});

	test("accepts valid update payload", () => {
		const parsed = updateRegistrationFormRsvpSettingSchema.safeParse({
			eventId: "12",
			registrationFormId: "9",
			enabled: true,
			rsvp_required: true,
			rsvp_expires_in_hours: 72,
			review_sla_hours: 48,
			notify_by_date: "2026-05-15T18:00:00.000Z",
		});
		expect(parsed.success).toBe(true);
	});

	test("accepts never-expire payload", () => {
		const parsed = updateRegistrationFormRsvpSettingSchema.safeParse({
			eventId: "12",
			registrationFormId: "9",
			enabled: true,
			rsvp_required: true,
			rsvp_expires_in_hours: null,
			review_sla_hours: 48,
			notify_by_date: null,
		});
		expect(parsed.success).toBe(true);
	});
});
