import {
	butterflyShapeMap,
	heartShapeMap,
	infinityShapeMap,
} from "./shape-maps";
import { getTextShapePoints } from "./text-shape";

type ShapeKind = "heart" | "names" | "infinity" | "butterfly";

function sampleTargets(
	baseTargets: Array<{ x: number; y: number }>,
	count: number,
) {
	if (count <= 0) {
		return [];
	}

	const len = baseTargets.length;
	const stride = len / count;

	return Array.from({ length: count }, (_, index) => {
		const targetIndex = Math.floor((index * stride) % len);
		const base = baseTargets[targetIndex];
		return { x: base.x, y: base.y };
	});
}

export function getShapeTargets(input: {
	shape: ShapeKind;
	count: number;
	text: string | null;
}): Array<{ x: number; y: number }> {
	if (input.shape === "names") {
		return getTextShapePoints(input.text ?? "Bride & Groom", input.count);
	}

	if (input.shape === "infinity") {
		return sampleTargets(infinityShapeMap, input.count);
	}

	if (input.shape === "butterfly") {
		return sampleTargets(butterflyShapeMap, input.count);
	}

	return sampleTargets(heartShapeMap, input.count);
}

/**
 * GLOBE FORMATION (Fibonacci Sphere)
 */
export function getGlobeTargets(
	count: number,
	rotation = 0,
): Array<{ x: number; y: number; z: number }> {
	const points: Array<{ x: number; y: number; z: number }> = [];
	const phi = Math.PI * (3 - Math.sqrt(5));
	const pitch = Math.PI / 8; // Slightly more tilt for better depth perception
	const cameraDistance = 2.1; // Closer camera for stronger perspective (3D feel)

	for (let i = 0; i < count; i++) {
		const y = 1 - (i / (count - 1)) * 2;
		const radius = Math.sqrt(1 - y * y);
		const theta = phi * i + rotation;

		const x = Math.cos(theta) * radius;
		const z = Math.sin(theta) * radius;

		// Rotate around X-axis (pitch)
		const yRot = y * Math.cos(pitch) - z * Math.sin(pitch);
		const zRot = y * Math.sin(pitch) + z * Math.cos(pitch);

		const perspective = cameraDistance / (cameraDistance - zRot);

		points.push({
			x: 50 + x * 18 * perspective, // Slightly narrower X to compensate for widescreen
			y: 52 + yRot * 32 * perspective, // Taller Y to make it look less squashed
			z: zRot,
		});
	}

	return points;
}
