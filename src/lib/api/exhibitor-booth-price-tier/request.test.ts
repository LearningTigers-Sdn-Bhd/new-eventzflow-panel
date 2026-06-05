import { describe, expect, test } from "bun:test";
import {
	createExhibitorBoothPriceTierSchema,
	deleteExhibitorBoothPriceTierSchema,
	updateExhibitorBoothPriceTierSchema,
} from "./request";

describe("exhibitor booth price tier request schemas", () => {
	test("accepts a valid booth price tier", () => {
		const parsed = createExhibitorBoothPriceTierSchema.safeParse({
			exhibitor_booth_price_id: 10,
			label: "Early Bird",
			price: 1200,
			start_date: new Date().toISOString(),
			end_date: new Date(Date.now() + 86_400_000).toISOString(),
		});

		expect(parsed.success).toBe(true);
	});

	test("rejects negative price", () => {
		const parsed = updateExhibitorBoothPriceTierSchema.safeParse({
			exhibitor_booth_price_id: 10,
			id: 3,
			label: "Early Bird",
			price: -1,
			start_date: new Date().toISOString(),
		});

		expect(parsed.success).toBe(false);
	});

	test("requires id for delete", () => {
		const parsed = deleteExhibitorBoothPriceTierSchema.safeParse({
			exhibitor_booth_price_id: 10,
		});

		expect(parsed.success).toBe(false);
	});
});
