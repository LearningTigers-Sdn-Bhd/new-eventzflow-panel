import { describe, expect, test } from "bun:test";
import {
	buildPublicRegistrationLandingTitle,
	buildPublicRegistrationTypeTitle,
} from "./title";

describe("public registration title helpers", () => {
	test("builds landing page title with event name when available", () => {
		expect(buildPublicRegistrationLandingTitle("Dev Summit 2026")).toBe(
			"Register - Dev Summit 2026",
		);
	});

	test("falls back to generic landing page title", () => {
		expect(buildPublicRegistrationLandingTitle()).toBe("Event Registration");
	});

	test("builds type page title from event and form names", () => {
		expect(
			buildPublicRegistrationTypeTitle("Dev Summit 2026", "vip-pass"),
		).toBe("Vip Pass Registration - Dev Summit 2026");
	});

	test("builds type page title with event only", () => {
		expect(buildPublicRegistrationTypeTitle("Dev Summit 2026")).toBe(
			"Registration - Dev Summit 2026",
		);
	});

	test("falls back to generic type page title", () => {
		expect(buildPublicRegistrationTypeTitle()).toBe("Event Registration");
	});
});
