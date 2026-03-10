import { describe, expect, test } from "bun:test";
import {
	guestPolicyLimitToValue,
	guestPolicyValueFromLimit,
} from "./guest-policy";

describe("guest policy helpers", () => {
	test("maps nil limit to unlimited mode", () => {
		expect(guestPolicyValueFromLimit(null)).toEqual({
			mode: "unlimited",
			limit: 1,
		});
	});

	test("maps zero limit to none mode", () => {
		expect(guestPolicyValueFromLimit(0)).toEqual({
			mode: "none",
			limit: 1,
		});
	});

	test("maps numeric limit to limited mode", () => {
		expect(guestPolicyValueFromLimit(4)).toEqual({
			mode: "limited",
			limit: 4,
		});
	});

	test("serializes unlimited mode to nil", () => {
		expect(guestPolicyLimitToValue("unlimited", 6)).toBeNull();
	});

	test("serializes none mode to zero", () => {
		expect(guestPolicyLimitToValue("none", 6)).toBe(0);
	});

	test("serializes limited mode to positive integer", () => {
		expect(guestPolicyLimitToValue("limited", 6)).toBe(6);
	});
});
