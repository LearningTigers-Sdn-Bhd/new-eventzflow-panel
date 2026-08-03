import { describe, expect, test } from "bun:test";
import {
	generateBoothRange,
	parsePastedBoothNumbers,
} from "./booth-inventory-utils";

describe("booth inventory entry helpers", () => {
	test("generates zero-padded booth numbers inclusively", () => {
		expect(generateBoothRange({ prefix: "s", from: 1, to: 3 })).toEqual([
			"S001",
			"S002",
			"S003",
		]);
	});

	test("returns no range when the end is before the start", () => {
		expect(generateBoothRange({ prefix: "S", from: 3, to: 1 })).toEqual([]);
	});

	test("parses comma and newline separated numbers case-insensitively", () => {
		expect(parsePastedBoothNumbers(" s045, S046\ns045\n K101 ")).toEqual([
			"S045",
			"S046",
			"K101",
		]);
	});
});
