import { describe, expect, test } from "bun:test";
import { GET } from "./route";

describe("GET /api/health", () => {
	test("returns an ok health response", async () => {
		const response = await GET();

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ status: "ok" });
	});
});
