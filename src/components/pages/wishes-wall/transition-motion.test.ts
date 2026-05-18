import { describe, expect, test } from "bun:test";
import {
	buildTransitionSnapshot,
	GLOBE_INTRO_DURATION_MS,
	SHAPE_SETTLE_DURATION_MS,
} from "./transition-motion";

describe("buildTransitionSnapshot", () => {
	const globeTarget = { x: 42, y: 26, z: 0.85 };
	const shapeTarget = { x: 68, y: 61 };

	test("holds nodes in the globe during the intro window", () => {
		const snapshot = buildTransitionSnapshot({
			elapsedMs: GLOBE_INTRO_DURATION_MS - 50,
			globeTarget,
			shapeTarget,
			index: 12,
		});

		expect(snapshot.progress).toBe(0);
		expect(snapshot.x).toBe(globeTarget.x);
		expect(snapshot.y).toBe(globeTarget.y);
		expect(snapshot.scale).toBeGreaterThan(1);
		expect(snapshot.opacity).toBeLessThan(1);
	});

	test("lands on the final shape target after the settle window", () => {
		const snapshot = buildTransitionSnapshot({
			elapsedMs: GLOBE_INTRO_DURATION_MS + SHAPE_SETTLE_DURATION_MS + 100,
			globeTarget,
			shapeTarget,
			index: 12,
		});

		expect(snapshot.progress).toBe(1);
		expect(snapshot.x).toBeCloseTo(shapeTarget.x, 5);
		expect(snapshot.y).toBeCloseTo(shapeTarget.y, 5);
		expect(snapshot.scale).toBeCloseTo(1, 5);
		expect(snapshot.opacity).toBe(1);
	});

	test("moves each node gradually between globe and shape", () => {
		const midpoint = buildTransitionSnapshot({
			elapsedMs: GLOBE_INTRO_DURATION_MS + SHAPE_SETTLE_DURATION_MS / 2,
			globeTarget,
			shapeTarget,
			index: 12,
		});

		expect(midpoint.progress).toBeGreaterThan(0.3);
		expect(midpoint.progress).toBeLessThan(0.8);
		expect(midpoint.x).toBeGreaterThan(globeTarget.x);
		expect(midpoint.x).toBeLessThan(shapeTarget.x);
		expect(midpoint.y).toBeGreaterThan(globeTarget.y);
		expect(midpoint.y).toBeLessThan(shapeTarget.y);
	});
});
