import { describe, expect, test } from "bun:test";
import * as requestModule from "./request";

describe("public registration request module", () => {
	test("does not expose conference-specific schema", () => {
		expect("conferenceSchema" in requestModule).toBe(false);
	});

	test("accepts exactly one attendee for fixed ticket-creation form", () => {
		const result = requestModule.simpleRegistrationSchema.safeParse({
			attendees: [
				{
					attendee_name: "Jane Doe",
					attendee_email: "jane@example.com",
					attendee_phone: "0123456789",
					company_name: "Acme",
					job_title: "Engineer",
					country: "Malaysia",
				},
			],
		});

		expect(result.success).toBe(true);
	});

	test("accepts multiple attendees at schema level", () => {
		const result = requestModule.simpleRegistrationSchema.safeParse({
			attendees: [
				{
					attendee_name: "Jane Doe",
					attendee_email: "jane@example.com",
					attendee_phone: "0123456789",
					company_name: "Acme",
					job_title: "Engineer",
					country: "Malaysia",
				},
				{
					attendee_name: "John Doe",
					attendee_email: "john@example.com",
					attendee_phone: "0188888888",
					company_name: "Beta",
					job_title: "Manager",
					country: "Malaysia",
				},
			],
		});

		expect(result.success).toBe(true);
	});

	test("rejects attendee phone with non-phone characters", () => {
		const result = requestModule.simpleRegistrationSchema.safeParse({
			attendees: [
				{
					attendee_name: "Jane Doe",
					attendee_email: "jane@example.com",
					attendee_phone: "Eos rerum consequat",
					company_name: "Acme",
					job_title: "Engineer",
					country: "Malaysia",
				},
			],
		});

		expect(result.success).toBe(false);
	});

	test("validates attendee count for single mode", () => {
		expect(
			requestModule.validateAttendeeCount(1, {
				registration_mode: "single",
				min_attendees: 1,
			}),
		).toBeNull();

		expect(
			requestModule.validateAttendeeCount(2, {
				registration_mode: "single",
				min_attendees: 1,
			}),
		).toBe("This ticket type allows exactly 1 attendee.");
	});

	test("validates attendee count for group mode", () => {
		expect(
			requestModule.validateAttendeeCount(2, {
				registration_mode: "group",
				min_attendees: 3,
			}),
		).toBe("This ticket type requires at least 3 attendees.");

		expect(
			requestModule.validateAttendeeCount(3, {
				registration_mode: "group",
				min_attendees: 3,
			}),
		).toBeNull();
	});
});
