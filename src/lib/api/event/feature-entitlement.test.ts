import { describe, expect, test } from "bun:test";
import { createEventSchema, updateEventSchema } from "./request";

describe("event feature entitlement schema", () => {
	test("accepts enable_exhibitor_management in create payload schema", () => {
		expect(
			createEventSchema.parse({
				title: "Expo",
				start_date: new Date().toISOString(),
				end_date: new Date(Date.now() + 60_000).toISOString(),
				enable_exhibitor_management: true,
			}),
		).toMatchObject({
			enable_exhibitor_management: true,
		});
	});

	test("accepts enable_exhibitor_management in update payload schema", () => {
		expect(
			updateEventSchema.parse({
				enable_exhibitor_management: true,
			}),
		).toMatchObject({
			enable_exhibitor_management: true,
		});
	});
});
