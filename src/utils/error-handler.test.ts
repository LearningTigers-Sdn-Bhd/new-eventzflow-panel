import { describe, expect, test } from "bun:test";
import { isNotFoundError } from "./error-handler";

describe("isNotFoundError", () => {
	test("recognizes an HTTP 404 by response status", () => {
		expect(isNotFoundError({ response: { status: 404 } })).toBe(true);
	});

	test("does not treat a rewritten message as a 404", () => {
		expect(isNotFoundError(new Error("No payment details found"))).toBe(false);
	});

	test("does not classify other HTTP statuses as not found", () => {
		expect(isNotFoundError({ response: { status: 500 } })).toBe(false);
	});
});
