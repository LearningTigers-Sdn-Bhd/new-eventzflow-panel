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
			exhibitor_zone_id: 12,
			label: "Shell Scheme Booth (3m x 3m)",
			price: 2000,
			quota: 30,
			conferences_included: false,
		});

		expect(parsed.success).toBe(true);
	});

	test("accepts raw space booth type with positive price", () => {
		const parsed = createExhibitorBoothPriceSchema.safeParse({
			event_id: 10,
			booth_type: "raw_space",
			exhibitor_zone_id: 7,
			label: "Raw Booth",
			price: 0,
			quota: null,
			conferences_included: false,
		});

		expect(parsed.success).toBe(true);
	});

	test("rejects empty booth type", () => {
		const parsed = createExhibitorBoothPriceSchema.safeParse({
			event_id: 10,
			booth_type: "",
			exhibitor_zone_id: 12,
			label: "Corner Booth",
			price: 4000,
		});

		expect(parsed.success).toBe(false);
	});

	test("accepts custom booth type", () => {
		const parsed = createExhibitorBoothPriceSchema.safeParse({
			event_id: 10,
			booth_type: "corner_booth",
			exhibitor_zone_id: 12,
			label: "Corner Booth (3m x 3m)",
			price: 4000,
			conferences_included: false,
		});

		expect(parsed.success).toBe(true);
	});

	test("accepts conferences included flag", () => {
		const parsed = createExhibitorBoothPriceSchema.safeParse({
			event_id: 10,
			booth_type: "shell_scheme",
			exhibitor_zone_id: 12,
			label: "Conference Booth",
			price: 2500,
			conferences_included: true,
		});

		expect(parsed.success).toBe(true);
		expect(parsed.success && parsed.data.conferences_included).toBe(true);
	});

	test("rejects negative price on update", () => {
		const parsed = updateExhibitorBoothPriceSchema.safeParse({
			id: 8,
			booth_type: "raw_space",
			exhibitor_zone_id: 7,
			label: "Raw Booth",
			price: -1,
			quota: 5,
		});

		expect(parsed.success).toBe(false);
	});

	test("accepts optional quota as non-negative integer", () => {
		const parsed = createExhibitorBoothPriceSchema.safeParse({
			event_id: 11,
			booth_type: "shell_scheme",
			exhibitor_zone_id: 2,
			label: "International",
			price: 3200,
			quota: 0,
			conferences_included: false,
		});

		expect(parsed.success).toBe(true);
	});

	test("rejects decimal quota", () => {
		const parsed = createExhibitorBoothPriceSchema.safeParse({
			event_id: 11,
			booth_type: "shell_scheme",
			exhibitor_zone_id: 2,
			label: "International",
			price: 3200,
			quota: 1.5,
		});

		expect(parsed.success).toBe(false);
	});

	test("rejects negative quota", () => {
		const parsed = createExhibitorBoothPriceSchema.safeParse({
			event_id: 11,
			booth_type: "shell_scheme",
			exhibitor_zone_id: 2,
			label: "International",
			price: 3200,
			quota: -1,
		});

		expect(parsed.success).toBe(false);
	});

	test("validates delete requires id", () => {
		const parsed = deleteExhibitorBoothPriceSchema.safeParse({});
		expect(parsed.success).toBe(false);
	});
});
