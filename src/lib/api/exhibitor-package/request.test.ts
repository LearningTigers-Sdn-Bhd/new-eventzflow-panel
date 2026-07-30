import { describe, expect, test } from "bun:test";
import {
	createExhibitorPackageSchema,
	deleteExhibitorPackageSchema,
	updateExhibitorPackageSchema,
} from "./request";

describe("exhibitor package request schemas", () => {
	test("accepts a valid package", () => {
		const parsed = createExhibitorPackageSchema.safeParse({
			event_id: 5,
			exhibitor_booth_price_id: 10,
			name: "Package A | Standard Booth",
			inclusions: "6D5N hotel",
			price: 7000,
			quota: 40,
		});

		expect(parsed.success).toBe(true);
	});

	test("accepts a null quota", () => {
		const parsed = createExhibitorPackageSchema.safeParse({
			event_id: 5,
			exhibitor_booth_price_id: 10,
			name: "Package A",
			price: 7000,
			quota: null,
		});

		expect(parsed.success).toBe(true);
	});

	test("requires a booth price", () => {
		const parsed = createExhibitorPackageSchema.safeParse({
			event_id: 5,
			name: "Package A",
			price: 7000,
		});

		expect(parsed.success).toBe(false);
	});

	test("rejects a blank name", () => {
		const parsed = createExhibitorPackageSchema.safeParse({
			event_id: 5,
			exhibitor_booth_price_id: 10,
			name: "   ",
			price: 7000,
		});

		expect(parsed.success).toBe(false);
	});

	test("rejects a negative price", () => {
		const parsed = updateExhibitorPackageSchema.safeParse({
			id: 3,
			exhibitor_booth_price_id: 10,
			name: "Package A",
			price: -1,
		});

		expect(parsed.success).toBe(false);
	});

	test("requires id for delete", () => {
		expect(deleteExhibitorPackageSchema.safeParse({}).success).toBe(false);
	});
});
