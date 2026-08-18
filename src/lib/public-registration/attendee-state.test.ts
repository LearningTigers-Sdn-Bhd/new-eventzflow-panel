import { describe, expect, test } from "bun:test";
import {
	type AttendeeStateRow,
	getDuplicateAttendeeEmailIndexes,
	normalizeAttendeesForMode,
	syncAttendeeCustomFieldKeys,
} from "./attendee-state";

interface MockAttendee extends AttendeeStateRow {
	row_id: string;
}

function mockAttendee(
	rowId: string,
	custom_fields_data: Record<string, string> = {},
): MockAttendee {
	return { row_id: rowId, custom_fields_data };
}

describe("attendee-state", () => {
	test("single mode keeps existing array reference when attendee count is already one", () => {
		const current = [mockAttendee("1")];

		const next = normalizeAttendeesForMode(current, {
			registrationMode: "single",
			minAttendees: 1,
			createAttendee: () => mockAttendee("new"),
		});

		expect(next).toBe(current);
	});

	test("single mode trims attendees down to one", () => {
		const current = [mockAttendee("1"), mockAttendee("2")];

		const next = normalizeAttendeesForMode(current, {
			registrationMode: "single",
			minAttendees: 1,
			createAttendee: () => mockAttendee("new"),
		});

		expect(next).toHaveLength(1);
		expect(next[0].row_id).toBe("1");
	});

	test("group mode adds attendees until minimum is met", () => {
		const current = [mockAttendee("1")];

		const next = normalizeAttendeesForMode(current, {
			registrationMode: "group",
			minAttendees: 3,
			createAttendee: () => mockAttendee("new", { member_id: "" }),
		});

		expect(next).toHaveLength(3);
	});

	test("sync custom fields keeps array reference when keys are already aligned", () => {
		const current = [
			mockAttendee("1", { member_id: "A001", company: "Acme" }),
			mockAttendee("2", { member_id: "A002", company: "Beta" }),
		];

		const next = syncAttendeeCustomFieldKeys(current, ["member_id", "company"]);

		expect(next).toBe(current);
	});

	test("sync custom fields adds missing keys and removes extra keys", () => {
		const current = [
			mockAttendee("1", {
				member_id: "A001",
				extra: "legacy",
			}),
		];

		const next = syncAttendeeCustomFieldKeys(current, ["member_id", "company"]);

		expect(next).not.toBe(current);
		expect(next[0].custom_fields_data).toEqual({
			member_id: "A001",
			company: "",
		});
	});

	test("duplicate attendee emails are reported when multiple tickets are disabled", () => {
		expect(
			getDuplicateAttendeeEmailIndexes(
				[
					{ attendee_email: "buyer@example.com" },
					{ attendee_email: "BUYER@example.com" },
				],
				"group",
				false,
			),
		).toEqual(new Set([0, 1]));
	});

	test("duplicate attendee emails are ignored when multiple tickets are enabled", () => {
		expect(
			getDuplicateAttendeeEmailIndexes(
				[
					{ attendee_email: "buyer@example.com" },
					{ attendee_email: "buyer@example.com" },
				],
				"group",
				true,
			),
		).toEqual(new Set());
	});
});
