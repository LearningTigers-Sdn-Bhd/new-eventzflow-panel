import { describe, expect, test } from "bun:test";
import { createExhibitorVoucherSchema } from "./request";

describe("createExhibitorVoucherSchema", () => {
	test("accepts a valid unscoped percentage voucher", () => {
		const result = createExhibitorVoucherSchema.safeParse({
			event_id: 1,
			discount_type: "percentage_off",
			discount_value: 15,
		});

		expect(result.success).toBe(true);
	});

	test("rejects a zero discount value", () => {
		const result = createExhibitorVoucherSchema.safeParse({
			event_id: 1,
			discount_type: "flat_price",
			discount_value: 0,
		});

		expect(result.success).toBe(false);
	});

	test("rejects a missing discount_type", () => {
		const result = createExhibitorVoucherSchema.safeParse({
			event_id: 1,
			discount_value: 10,
		});

		expect(result.success).toBe(false);
	});

	test("rejects a percentage discount above 100", () => {
		const result = createExhibitorVoucherSchema.safeParse({
			event_id: 1,
			discount_type: "percentage_off",
			discount_value: 101,
		});

		expect(result.success).toBe(false);
	});
});
