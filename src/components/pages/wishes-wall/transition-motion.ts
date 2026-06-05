export const GLOBE_INTRO_DURATION_MS = 2200;
export const SHAPE_SETTLE_DURATION_MS = 2600;

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(value: number) {
	return value < 0.5
		? 4 * value * value * value
		: 1 - (-2 * value + 2) ** 3 / 2;
}

export function buildTransitionSnapshot(input: {
	elapsedMs: number;
	globeTarget: { x: number; y: number; z?: number };
	shapeTarget: { x: number; y: number };
	index: number;
}) {
	const transitionElapsed = input.elapsedMs - GLOBE_INTRO_DURATION_MS;
	const progress = clamp(transitionElapsed / SHAPE_SETTLE_DURATION_MS, 0, 1);
	const eased = easeInOutCubic(progress);
	const dx = input.shapeTarget.x - input.globeTarget.x;
	const dy = input.shapeTarget.y - input.globeTarget.y;
	const distance = Math.hypot(dx, dy) || 1;
	const normalX = -dy / distance;
	const normalY = dx / distance;
	const swirlSeed = (input.index % 7) / 6;
	const swirlAmplitude = (1 - eased) * eased * (4 + swirlSeed * 4);
	const swirlX = normalX * swirlAmplitude;
	const swirlY = normalY * swirlAmplitude;
	const depth = input.globeTarget.z ?? 0;

	return {
		progress,
		x: input.globeTarget.x + dx * eased + swirlX,
		y: input.globeTarget.y + dy * eased + swirlY,
		// More dramatic scale for globe (stronger 3D depth)
		scale: 1 + depth * 0.35 * (1 - eased),
		// More pronounced opacity: back elements fade more while front ones shine
		opacity: clamp(0.35 + (depth + 1) * 0.32 + eased * 0.22, 0.2, 1),
		depth,
	};
}
