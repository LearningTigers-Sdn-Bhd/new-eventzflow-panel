import { describe, expect, test } from "bun:test";
import {
	createExhibitorBoothPriceSchema,
	deleteExhibitorBoothPriceSchema,
	updateExhibitorBoothPriceSchema,
} from "./request";

describe("exhibitor booth price request schemas", () => {
	test("accepts shell scheme booth type with positive price", () => {
		const parsed = createExhibitorBoothPriceSchema.safeParse({
			event_id: 10,
			booth_type: "shell_scheme",
			label: "Shell Scheme Booth (3m x 3m)",
			price: 2000,
		});

		expect(parsed.success).toBe(true);
	});

	test("accepts raw space booth type with positive price", () => {
		const parsed = createExhibitorBoothPriceSchema.safeParse({
			event_id: 10,
			booth_type: "raw_space",
			label: "Raw Booth",
			price: 0,
		});

		expect(parsed.success).toBe(true);
	});

	test("rejects empty booth type", () => {
		const parsed = createExhibitorBoothPriceSchema.safeParse({
			event_id: 10,
			booth_type: "",
			label: "Corner Booth",
			price: 4000,
		});

		expect(parsed.success).toBe(false);
	});

	test("rejects unsupported booth type", () => {
		const parsed = createExhibitorBoothPriceSchema.safeParse({
			event_id: 10,
			booth_type: "corner_booth",
			label: "Corner Booth (3m x 3m)",
			price: 4000,
		});

		expect(parsed.success).toBe(false);
	});

	test("rejects negative price on update", () => {
		const parsed = updateExhibitorBoothPriceSchema.safeParse({
			id: 8,
			booth_type: "raw_space",
			label: "Raw Booth",
			price: -1,
		});

		expect(parsed.success).toBe(false);
	});

	test("validates delete requires id", () => {
		const parsed = deleteExhibitorBoothPriceSchema.safeParse({});
		expect(parsed.success).toBe(false);
	});
});
