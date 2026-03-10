import { describe, expect, test } from "bun:test";
import { buildRsvpPageTitle } from "./title";

describe("rsvp title helpers", () => {
	test("builds the RSVP page title with event name when available", () => {
		expect(buildRsvpPageTitle("John & Jane's Wedding")).toBe(
			"Invitation RSVP - John & Jane's Wedding",
		);
	});

	test("falls back to a generic RSVP page title", () => {
		expect(buildRsvpPageTitle()).toBe("Invitation RSVP");
	});
});
