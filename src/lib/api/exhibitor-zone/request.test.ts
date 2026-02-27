import { describe, expect, test } from "bun:test";
import {
	createExhibitorZoneSchema,
	deleteExhibitorZoneSchema,
	updateExhibitorZoneSchema,
} from "./request";

describe("exhibitor zone request schemas", () => {
	test("accepts valid create payload", () => {
		const parsed = createExhibitorZoneSchema.safeParse({
			event_id: 10,
			zone: "zone_d",
			quota: 103,
		});

		expect(parsed.success).toBe(true);
	});

	test("accepts nullable quota", () => {
		const parsed = updateExhibitorZoneSchema.safeParse({
			id: 5,
			zone: "zone_a",
			quota: null,
		});

		expect(parsed.success).toBe(true);
	});

	test("rejects negative quota", () => {
		const parsed = updateExhibitorZoneSchema.safeParse({
			id: 5,
			zone: "zone_a",
			quota: -1,
		});

		expect(parsed.success).toBe(false);
	});

	test("validates delete requires id", () => {
		const parsed = deleteExhibitorZoneSchema.safeParse({});
		expect(parsed.success).toBe(false);
	});
});
