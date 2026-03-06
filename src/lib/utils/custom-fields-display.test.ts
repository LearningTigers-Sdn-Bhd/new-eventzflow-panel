import { describe, expect, test } from "bun:test";
import { formatCustomFieldEntries } from "./custom-fields-display";

describe("formatCustomFieldEntries", () => {
	test("humanizes snake_case keys and stringifies non-string values", () => {
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
			{ key: "nullable_note", label: "Nullable Note", value: "-" },
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
});
