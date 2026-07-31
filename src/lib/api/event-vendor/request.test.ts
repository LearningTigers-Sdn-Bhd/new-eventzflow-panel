import { describe, expect, test } from "bun:test";
import { createEventVendorSchema } from "./request";

describe("createEventVendorSchema", () => {
	test("accepts and trims an exhibitor voucher code", () => {
		const result = createEventVendorSchema.parse({
			vendor_id: 1,
			exhibitor_kit_attributes: {
				pic_full_name: "Ada",
				pic_contact_number: "123",
				voucher_code: "  A7K2M9XQ  ",
			},
		});

		expect(result.exhibitor_kit_attributes?.voucher_code).toBe("A7K2M9XQ");
	});
});
