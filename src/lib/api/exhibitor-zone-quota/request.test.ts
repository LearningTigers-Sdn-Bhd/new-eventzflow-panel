import { describe, expect, test } from "bun:test";
import {
	createExhibitorZoneQuotaSchema,
	deleteExhibitorZoneQuotaSchema,
	updateExhibitorZoneQuotaSchema,
} from "./request";

describe("exhibitor zone quota request schemas", () => {
	test("accepts valid create payload", () => {
		const parsed = createExhibitorZoneQuotaSchema.safeParse({
			event_id: 10,
			zone: "zone_d",
			quota: 103,
		});

		expect(parsed.success).toBe(true);
	});

	test("rejects negative quota", () => {
		const parsed = updateExhibitorZoneQuotaSchema.safeParse({
			id: 5,
			zone: "zone_a",
			quota: -1,
		});

		expect(parsed.success).toBe(false);
	});

	test("validates delete requires id", () => {
		const parsed = deleteExhibitorZoneQuotaSchema.safeParse({});
		expect(parsed.success).toBe(false);
	});
});
