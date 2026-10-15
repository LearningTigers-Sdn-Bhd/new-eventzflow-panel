import { describe, expect, test } from "bun:test";
import {
	formatCustomFieldEntries,
	formatTicketCustomFieldEntries,
	formatTicketCustomFieldValue,
} from "./custom-fields-display";

describe("formatCustomFieldEntries", () => {
	test("humanizes snake_case keys and stringifies non-string values while dropping empty entries", () => {
		const formatted = formatCustomFieldEntries({
			company_profile: "Energy solutions provider",
			booth_setup_time: "9:00 AM",
			is_featured: true,
			tags: ["premium", "corner"],
			other_services: ["Advertising Opportunities", "Non-Official Contractor"],
			details: { hall: "A" },
			nullable_note: null,
		});

		expect(formatted).toEqual([
			{
				key: "company_profile",
				label: "Company Profile",
				value: "Energy solutions provider",
			},
			{
				key: "booth_setup_time",
				label: "Booth Setup Time",
				value: "9:00 AM",
			},
			{ key: "is_featured", label: "Is Featured", value: "true" },
			{ key: "tags", label: "Tags", value: "premium, corner" },
			{
				key: "other_services",
				label: "Other Services",
				value: "- Advertising Opportunities\n- Non-Official Contractor",
			},
			{ key: "details", label: "Details", value: '{"hall":"A"}' },
		]);
	});

	test("returns an empty list when data is missing", () => {
		expect(formatCustomFieldEntries(undefined)).toEqual([]);
		expect(formatCustomFieldEntries(null)).toEqual([]);
	});

	test("normalizes JSON array strings into readable text", () => {
		const formatted = formatCustomFieldEntries({
			other_services: '["Advertising Opportunities","Non-Official Contractor"]',
		});

		expect(formatted[0]?.value).toBe(
			"- Advertising Opportunities\n- Non-Official Contractor",
		);
	});

	test("hides internal and effectively empty custom fields", () => {
		const formatted = formatCustomFieldEntries({
			_public_booking_fingerprint: "internal-hash",
			zone: null,
			payment_option: "later",
			is_booth_manager: true,
			product_category: "",
			preferred_booth_location: "   ",
			other_services: [],
			booth_note: "Corner request",
			visible_array: ["Shell Scheme"],
			dash_value: "-",
			stringified_empty_array: " [] ",
		});

		expect(formatted).toEqual([
			{ key: "booth_note", label: "Booth Note", value: "Corner request" },
			{ key: "visible_array", label: "Visible Array", value: "Shell Scheme" },
		]);
	});
});

describe("formatTicketCustomFieldValue", () => {
	test("formats indemnity audit data for the admin ticket panel", () => {
		const formatted = formatTicketCustomFieldValue("_indemnity", {
			accepted: true,
			method: "uploaded_form",
			signed_name: "Abu Bakar",
			signed_at: "2026-07-29T01:30:00.000Z",
		});

		expect(formatted).toContain("Accepted");
		expect(formatted).toContain("Signed by: Abu Bakar");
		expect(formatted).toContain("Method: Uploaded Form");
		expect(formatted).toContain("Signed at:");
		expect(formatted).not.toContain("[object Object]");
	});

	test("keeps generic ticket custom fields readable", () => {
		expect(
			formatTicketCustomFieldValue("vehicle_info", { make: "Toyota" }),
		).toBe('{"make":"Toyota"}');
	});

	test("formats the terms acknowledgement for the admin ticket panel", () => {
		const formatted = formatTicketCustomFieldValue("_terms_agreement", {
			accepted: true,
			acknowledged_name: "Ali Bin Ahmad",
			method: "checkbox_typed_name",
			terms_version: "borneo-safari-sabah-registration-terms-v1",
			accepted_at: "2026-08-06T01:30:00.000Z",
		});

		expect(formatted).toContain("Accepted");
		expect(formatted).toContain("Acknowledged by: Ali Bin Ahmad");
		expect(formatted).toContain(
			"Terms version: borneo-safari-sabah-registration-terms-v1",
		);
		expect(formatted).toContain("Accepted at:");
		expect(formatted).not.toContain("[object Object]");
	});
});

describe("formatTicketCustomFieldEntries", () => {
	test("preserves raw keys for ticket table and edit-form lookups", () => {
		expect(
			formatTicketCustomFieldEntries({
				car_registration_number: "SAA1234A",
				_indemnity: { accepted: true },
			}),
		).toEqual([
			{ name: "car_registration_number", value: "SAA1234A" },
			{ name: "_indemnity", value: "Accepted" },
		]);
	});
});
