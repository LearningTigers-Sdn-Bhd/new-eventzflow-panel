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
});
