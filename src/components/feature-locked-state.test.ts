import { describe, expect, test } from "bun:test";
import { getFeatureLockedMessage } from "./feature-locked-state";

describe("getFeatureLockedMessage", () => {
	test("returns exhibitor-facing copy for vendor users", () => {
		expect(getFeatureLockedMessage({ isEventVendor: true })).toEqual({
			title: "Feature unavailable",
			description:
				"This feature is not available for this event at the moment. Please contact the event organizer for assistance.",
		});
	});

	test("returns subscription copy for internal users", () => {
		expect(getFeatureLockedMessage({ isOrganizer: true })).toEqual({
			title: "Feature unavailable",
			description:
				"This feature is not included in your current subscription for this event. Please contact your administrator to upgrade access.",
		});
	});
});
