import { describe, expect, test } from "bun:test";
import {
	assignExhibitorBoothSchema,
	bulkCreateExhibitorBoothsSchema,
	createExhibitorBoothSchema,
	deleteExhibitorBoothSchema,
	getExhibitorBoothsSchema,
	releaseExhibitorBoothSchema,
	updateExhibitorBoothSchema,
} from "./request";

describe("exhibitor booth request schemas", () => {
	test("accepts optional admin list filters", () => {
		const parsed = getExhibitorBoothsSchema.safeParse({
			event_id: 10,
			status: "reserved",
			exhibitor_booth_price_id: 7,
			exhibitor_zone_id: 3,
		});

		expect(parsed.success).toBe(true);
	});

	test("trims a booth number on create", () => {
		const parsed = createExhibitorBoothSchema.parse({
			event_id: 10,
			exhibitor_booth_price_id: 7,
			number: " S045 ",
			status: "available",
		});

		expect(parsed.number).toBe("S045");
	});

	test("requires at least one number for bulk creation", () => {
		const parsed = bulkCreateExhibitorBoothsSchema.safeParse({
			event_id: 10,
			exhibitor_booth_price_id: 7,
			numbers: [],
			status: "blocked",
		});

		expect(parsed.success).toBe(false);
	});

	test("accepts partial booth updates", () => {
		const parsed = updateExhibitorBoothSchema.safeParse({
			id: 12,
			status: "blocked",
		});

		expect(parsed.success).toBe(true);
	});

	test("rejects an unsupported booth status", () => {
		const parsed = createExhibitorBoothSchema.safeParse({
			event_id: 10,
			exhibitor_booth_price_id: 7,
			number: "S045",
			status: "sold",
		});

		expect(parsed.success).toBe(false);
	});

	test("requires ids for release and delete", () => {
		expect(releaseExhibitorBoothSchema.safeParse({}).success).toBe(false);
		expect(deleteExhibitorBoothSchema.safeParse({ id: 12 }).success).toBe(true);
	});

	test("accepts valid booth assignment ids", () => {
		expect(
			assignExhibitorBoothSchema.safeParse({ id: 12, exhibitor_kit_id: 34 })
				.success,
		).toBe(true);
	});

	test("rejects missing, zero, or negative booth assignment ids", () => {
		expect(assignExhibitorBoothSchema.safeParse({}).success).toBe(false);
		expect(
			assignExhibitorBoothSchema.safeParse({ id: 0, exhibitor_kit_id: 34 })
				.success,
		).toBe(false);
		expect(
			assignExhibitorBoothSchema.safeParse({ id: 12, exhibitor_kit_id: -1 })
				.success,
		).toBe(false);
	});
});
