import { describe, expect, test } from "bun:test";
import { getPublicExhibitorBoothsSchema } from "./request";

describe("public exhibitor booth request schema", () => {
	test("accepts an event slug and booth price", () => {
		const parsed = getPublicExhibitorBoothsSchema.safeParse({
			event_slug: "big-sabah-sale",
			exhibitor_booth_price_id: 7,
		});

		expect(parsed.success).toBe(true);
	});

	test("rejects a blank event slug", () => {
		const parsed = getPublicExhibitorBoothsSchema.safeParse({
			event_slug: " ",
			exhibitor_booth_price_id: 7,
		});

		expect(parsed.success).toBe(false);
	});
});
