import { describe, expect, test } from "bun:test";
import { updateExhibitorKitSchema } from "./request";

describe("updateExhibitorKitSchema", () => {
	test("keeps country and custom_fields_data in parsed payload", () => {
		const parsed = updateExhibitorKitSchema.safeParse({
			country: "Malaysia",
			custom_fields_data: {
				company_profile: "Energy solutions provider",
				booth_notes: "Near entrance",
			},
		});

		expect(parsed.success).toBe(true);
		if (!parsed.success) return;

		expect(parsed.data.country).toBe("Malaysia");
		expect(parsed.data.custom_fields_data).toEqual({
			company_profile: "Energy solutions provider",
			booth_notes: "Near entrance",
		});
	});

	test("accepts exhibitor team members with email and phone", () => {
		const parsed = updateExhibitorKitSchema.safeParse({
			exhibitor_team_members_attributes: [
				{
					full_name: "Jane Expo",
					email: "jane@example.com",
					phone: "+60123456789",
				},
			],
		});

		expect(parsed.success).toBe(true);
		if (!parsed.success) return;

		expect(parsed.data.exhibitor_team_members_attributes).toEqual([
			{
				full_name: "Jane Expo",
				email: "jane@example.com",
				phone: "+60123456789",
			},
		]);
	});

	test("rejects exhibitor team members missing the email/phone keys entirely", () => {
		const parsed = updateExhibitorKitSchema.safeParse({
			exhibitor_team_members_attributes: [
				{
					full_name: "Jane Expo",
				},
			],
		});

		expect(parsed.success).toBe(false);
	});

	test("accepts an active exhibitor team member with blank email and phone (optional for fast on-site registration)", () => {
		const parsed = updateExhibitorKitSchema.safeParse({
			exhibitor_team_members_attributes: [
				{
					full_name: "Walk-in Member",
					email: "",
					phone: "",
				},
			],
		});

		expect(parsed.success).toBe(true);
		if (!parsed.success) return;

		expect(parsed.data.exhibitor_team_members_attributes).toEqual([
			{
				full_name: "Walk-in Member",
				email: "",
				phone: "",
			},
		]);
	});

	test("still rejects an active exhibitor team member missing a name", () => {
		const parsed = updateExhibitorKitSchema.safeParse({
			exhibitor_team_members_attributes: [
				{
					full_name: "",
					email: "",
					phone: "",
				},
			],
		});

		expect(parsed.success).toBe(false);
	});

	test("allows deleting legacy exhibitor team members with blank email and phone", () => {
		const parsed = updateExhibitorKitSchema.safeParse({
			exhibitor_team_members_attributes: [
				{
					id: 123,
					full_name: "Legacy Member",
					email: "",
					phone: "",
					_destroy: true,
				},
			],
		});

		expect(parsed.success).toBe(true);
		if (!parsed.success) return;

		expect(parsed.data.exhibitor_team_members_attributes).toEqual([
			{
				id: 123,
				full_name: "Legacy Member",
				email: "",
				phone: "",
				_destroy: true,
			},
		]);
	});
});
