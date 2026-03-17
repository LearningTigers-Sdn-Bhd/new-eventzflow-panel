import { describe, expect, test, spyOn } from "bun:test";
import { getGlobeTargets, getShapeTargets } from "./shape-layout";

describe("getShapeTargets", () => {
	test("returns stable heart targets", () => {
		const targets = getShapeTargets({ shape: "heart", count: 12, text: null });

		expect(targets).toHaveLength(12);
		// After scaling: xRaw=16 (at t=PI/2), yRaw=4 (at t=PI/2)
		// x = 50 + 16 * 1.5 = 74
		// y = 46 - 4 * 3.0 = 34
		expect(targets[0].x).toBeCloseTo(74);
		expect(targets[0].y).toBeCloseTo(34);
	});

	test("generates targets for couple names text", () => {
		const randomMock = spyOn(Math, "random").mockReturnValue(0.5);

		const targets = getShapeTargets({
			shape: "names",
			count: 10,
			text: "Aisyah & Faiz",
		});

		expect(targets).toHaveLength(10);
		expect(targets[0]).toEqual({ x: 10, y: 35 });

		randomMock.mockRestore();
	});
});

describe("getGlobeTargets", () => {
	test("returns depth-aware targets across both hemispheres", () => {
		const targets = getGlobeTargets(150);

		expect(targets).toHaveLength(150);
		expect(Math.min(...targets.map((target) => target.z))).toBeLessThan(-0.25);
		expect(Math.max(...targets.map((target) => target.z))).toBeGreaterThan(0.25);
	});

	test("keeps the intro cluster compact enough to read as a globe", () => {
		const targets = getGlobeTargets(150);
		const xs = targets.map((target) => target.x);
		const ys = targets.map((target) => target.y);
		const width = Math.max(...xs) - Math.min(...xs);
		const height = Math.max(...ys) - Math.min(...ys);

		expect(width).toBeLessThan(56);
		expect(height).toBeLessThan(72);
		expect(height).toBeGreaterThan(width * 1.1);
	});
});
