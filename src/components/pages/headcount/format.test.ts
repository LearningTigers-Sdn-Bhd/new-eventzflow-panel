import { describe, expect, test } from "bun:test";
import {
	floorLabel,
	formatCount,
	occupancyPercent,
	occupancyTone,
} from "./format";

describe("formatCount", () => {
	test("shows a dash for missing figures and groups thousands", () => {
		expect(formatCount(null)).toBe("—");
		expect(formatCount(0)).toBe("0");
		expect(formatCount(1234)).toBe("1,234");
	});
});

describe("occupancyPercent", () => {
	test("is null without a figure or a usable capacity", () => {
		expect(occupancyPercent(null, 100)).toBeNull();
		expect(occupancyPercent(10, null)).toBeNull();
		expect(occupancyPercent(10, 0)).toBeNull();
	});

	test("rounds, and exceeds 100 when over capacity", () => {
		expect(occupancyPercent(40, 150)).toBe(27);
		expect(occupancyPercent(120, 100)).toBe(120);
	});
});

describe("occupancyTone", () => {
	test("calm below 70 %, busy from 70 %, red over capacity, slate without a figure", () => {
		expect(occupancyTone(null)).toBe("slate");
		expect(occupancyTone(0)).toBe("emerald");
		expect(occupancyTone(69)).toBe("emerald");
		expect(occupancyTone(70)).toBe("amber");
		expect(occupancyTone(100)).toBe("amber");
		expect(occupancyTone(101)).toBe("red");
	});
});

describe("floorLabel", () => {
	test("falls back for halls without a level", () => {
		expect(floorLabel(null)).toBe("No level set");
		expect(floorLabel("Level 2")).toBe("Level 2");
	});
});
