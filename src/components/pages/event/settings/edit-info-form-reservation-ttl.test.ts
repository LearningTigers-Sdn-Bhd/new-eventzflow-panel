import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(
	join(import.meta.dir, "edit-info-form.tsx"),
	"utf8",
);

describe("event settings exhibitor reservation TTL", () => {
	test("renders an optional hours input and sends blank as null", () => {
		expect(source).toContain('name="exhibitorReservationTtlHours"');
		expect(source).toContain("Hold unpaid booth reservations for (hours)");
		expect(source).toContain('inputType="number"');
		expect(source).toContain(
			'exhibitor_reservation_ttl_hours:\n\t\t\t\t\t\tvalue.exhibitorReservationTtlHours === ""',
		);
		expect(source).toContain("? null");
	});

	test("initializes a null TTL as a blank input", () => {
		expect(source).toContain(
			'event.exhibitor_reservation_ttl_hours?.toString() ?? ""',
		);
	});
});
