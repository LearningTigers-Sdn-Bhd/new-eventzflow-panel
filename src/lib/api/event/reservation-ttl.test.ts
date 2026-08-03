import { describe, expect, test } from "bun:test";
import { updateEventSchema } from "./request";

describe("event exhibitor reservation TTL schema", () => {
	test("accepts a positive whole number of hours", () => {
		expect(
			updateEventSchema.parse({
				exhibitor_reservation_ttl_hours: 48,
			}),
		).toMatchObject({
			exhibitor_reservation_ttl_hours: 48,
		});
	});

	test("accepts null so booth reservations never expire", () => {
		expect(
			updateEventSchema.parse({
				exhibitor_reservation_ttl_hours: null,
			}),
		).toMatchObject({
			exhibitor_reservation_ttl_hours: null,
		});
	});

	test("rejects fractional hours", () => {
		expect(() =>
			updateEventSchema.parse({
				exhibitor_reservation_ttl_hours: 1.5,
			}),
		).toThrow();
	});
});
