import { describe, expect, test } from "bun:test";
import { HTTPError, TimeoutError } from "ky";
import { ZodError } from "zod";
import { isBackendUnavailable } from "./backend-availability";

function httpError(status: number): HTTPError {
	const request = new Request("http://localhost/v1/auth/refresh_token");
	const response = new Response("", { status });
	return new HTTPError(response, request, {} as never);
}

describe("isBackendUnavailable", () => {
	test.each([502, 503, 504, 408])("HTTP %d is an outage", (status) => {
		expect(isBackendUnavailable(httpError(status))).toBe(true);
	});

	test.each([400, 401, 403, 422, 500])("HTTP %d is not an outage", (status) => {
		expect(isBackendUnavailable(httpError(status))).toBe(false);
	});

	test("network failure (fetch TypeError) is an outage", () => {
		expect(isBackendUnavailable(new TypeError("Failed to fetch"))).toBe(true);
	});

	test("non-JSON body from a proxy (SyntaxError) is an outage", () => {
		expect(isBackendUnavailable(new SyntaxError("Unexpected token <"))).toBe(
			true,
		);
	});

	test("ky timeout is an outage", () => {
		expect(
			isBackendUnavailable(new TimeoutError(new Request("http://localhost"))),
		).toBe(true);
	});

	test("validation and plain errors are not an outage", () => {
		expect(isBackendUnavailable(new ZodError([]))).toBe(false);
		expect(isBackendUnavailable(new Error("Token refresh failed"))).toBe(false);
	});
});
