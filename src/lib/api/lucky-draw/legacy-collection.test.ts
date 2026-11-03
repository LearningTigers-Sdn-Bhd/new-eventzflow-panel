import { describe, expect, test } from "bun:test";
import { parseLegacyCollection } from "./legacy-collection";

describe("legacy collection import", () => {
	test("matches old numeric-id strings and preserves claim and gift-only records", () => {
		const result = parseLegacyCollection(
			'["12", "13", "12"]',
			'{"12":"Voucher","14":"Hamper"}',
		);
		expect(result.ids).toEqual(["12", "13", "14"]);
		expect(result.claimed.has("12")).toBe(true);
		expect(result.claimed.has("14")).toBe(false);
		expect(result.gifts["14"]).toBe("Hamper");
	});
	test("handles empty storage", () => {
		expect(parseLegacyCollection(null, null).ids).toEqual([]);
	});
	test("rejects damaged data instead of silently discarding it", () => {
		for (const [claimed, gifts] of [
			["broken", "{}"],
			["{}", "{}"],
			["[12]", "{}"],
			["[]", "[]"],
			["[]", "null"],
			["[]", '{"12":true}'],
			["[]", JSON.stringify({ 12: "x".repeat(501) })],
		]) {
			expect(() => parseLegacyCollection(claimed, gifts)).toThrow();
		}
	});
});
