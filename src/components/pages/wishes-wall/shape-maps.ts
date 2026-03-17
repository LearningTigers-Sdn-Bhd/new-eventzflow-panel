// Optimized for a "String of Names" effect where names follow the path outline.

/** Utility: arc-length resample a raw point array down to `final` evenly-spaced points. */
function arcLengthResample(
	raw: Array<{ x: number; y: number }>,
	final: number,
): Array<{ x: number; y: number }> {
	const cumLen: number[] = [0];
	for (let i = 1; i < raw.length; i++) {
		const dx = raw[i].x - raw[i - 1].x;
		const dy = raw[i].y - raw[i - 1].y;
		cumLen.push(cumLen[i - 1] + Math.sqrt(dx * dx + dy * dy));
	}
	const totalLen = cumLen[raw.length - 1];
	const result: Array<{ x: number; y: number }> = [];
	let ri = 0;
	for (let s = 0; s < final; s++) {
		const target = (s / final) * totalLen;
		while (ri < raw.length - 1 && cumLen[ri + 1] < target) ri++;
		result.push({ x: raw[ri].x, y: raw[ri].y });
	}
	return result;
}

/** Utility: push N+1 arc points (inclusive) onto an array. */
function pushArc(
	out: Array<{ x: number; y: number }>,
	cx: number,
	cy: number,
	r: number,
	aStart: number,
	aEnd: number,
	n: number,
) {
	for (let i = 0; i <= n; i++) {
		const a = aStart + (aEnd - aStart) * (i / n);
		out.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
	}
}

/** Utility: push N+1 ellipse arc points (inclusive) onto an array. */
function pushEllipseArc(
	out: Array<{ x: number; y: number }>,
	cx: number,
	cy: number,
	rw: number,
	rh: number,
	aStart: number,
	aEnd: number,
	n: number,
) {
	for (let i = 0; i <= n; i++) {
		const a = aStart + (aEnd - aStart) * (i / n);
		out.push({ x: cx + Math.cos(a) * rw, y: cy + Math.sin(a) * rh });
	}
}

/**
 * HEART FORMATION
 * High-fidelity parametric heart formula — 200 evenly-spaced points along the
 * outline, scaled and centered for a tall, elegant heart silhouette.
 *
 * The points are ordered so that index 0 is the top-center notch and they
 * progress CLOCKWISE around the heart, enabling smooth clockwise name marching.
 */
export const heartShapeMap = (() => {
	const OVERSAMPLE = 2000;
	const FINAL = 200;

	const raw = Array.from({ length: OVERSAMPLE }, (_, i) => {
		const t = -(i / OVERSAMPLE) * Math.PI * 2 + Math.PI / 2;
		const sinT = Math.sin(t);
		const x = 16 * sinT * sinT * sinT;
		const y =
			13 * Math.cos(t) -
			5 * Math.cos(2 * t) -
			2 * Math.cos(3 * t) -
			Math.cos(4 * t);
		return { x: 50 + x * 1.5, y: 46 - y * 3.0 };
	});

	return arcLengthResample(raw, FINAL);
})();

/**
 * Returns the arc-length-sampled path for a given shape.
 * Used by the rAF loop in AnimatedWallRenderer to position nodes directly.
 * Note: "names" (Couple Names) is not yet supported on the frontend and
 * falls back to heart until a proper implementation is added.
 */
export function getShapePathPoints(
	shape: "heart" | "names" | "infinity" | "butterfly",
	text: string | null,
): Array<{ x: number; y: number }> {
	if (shape === "infinity") return infinityShapeMap;
	if (shape === "butterfly") return butterflyShapeMap;
	// "names" intentionally falls back to heart — not yet implemented on frontend
	return heartShapeMap;
}

/**
 * INFINITY FORMATION
 */
export const infinityShapeMap = (() => {
	const raw = Array.from({ length: 800 }, (_, i) => {
		const t = (i / 800) * Math.PI * 2;
		const sinT = Math.sin(t);
		const cosT = Math.cos(t);
		const denom = 1 + sinT * sinT;
		return {
			x: 50 + (cosT / denom) * 40,
			y: 50 - ((sinT * cosT) / denom) * 60,
		};
	});
	return arcLengthResample(raw, 200);
})();

/**
 * BUTTERFLY FORMATION
 *
 * A detailed butterfly silhouette with distinct upper and lower wing lobes
 * and a refined three-part body (head, thorax, abdomen).
 */
export const butterflyShapeMap = (() => {
	const FINAL = 200;
	const raw: Array<{ x: number; y: number }> = [];

	const CX = 50;
	const CY = 52;

	// Butterfly is traced in one continuous loop:
	// Right Upper -> Right Lower -> Left Lower -> Left Upper -> Body

	// --- Right Side ---
	const WING_STEPS = 50;
	// Upper Wing
	for (let i = 0; i <= WING_STEPS; i++) {
		const t = (i / WING_STEPS) * Math.PI;
		// Larger wings: 32 reach
		const r = 32 * Math.sin(t) * (1 + 0.3 * Math.cos(t));
		raw.push({
			x: CX + Math.cos(t - Math.PI / 3) * r + 0.5, // Even closer to center
			y: CY - Math.sin(t - Math.PI / 3) * r - 2, // Adjusted Y for better attachment
		});
	}

	// Lower Wing (Swallowtail style)
	for (let i = 0; i <= WING_STEPS; i++) {
		const t = (i / WING_STEPS) * Math.PI;
		// Larger wings: 26 reach
		const r = 26 * Math.sin(t) * (1 + 0.4 * Math.sin(3 * t));
		raw.push({
			x: CX + Math.cos(t + Math.PI / 4) * r + 0.2, // Even closer to center
			y: CY + Math.sin(t + Math.PI / 4) * r + 6,
		});
	}

	// --- Left Side (Mirrored) ---
	// Lower Wing
	for (let i = WING_STEPS; i >= 0; i--) {
		const t = (i / WING_STEPS) * Math.PI;
		const r = 26 * Math.sin(t) * (1 + 0.4 * Math.sin(3 * t));
		raw.push({
			x: CX - Math.cos(t + Math.PI / 4) * r - 0.2,
			y: CY + Math.sin(t + Math.PI / 4) * r + 6,
		});
	}

	// Upper Wing
	for (let i = WING_STEPS; i >= 0; i--) {
		const t = (i / WING_STEPS) * Math.PI;
		const r = 32 * Math.sin(t) * (1 + 0.3 * Math.cos(t));
		raw.push({
			x: CX - Math.cos(t - Math.PI / 3) * r - 0.5,
			y: CY - Math.sin(t - Math.PI / 3) * r - 2,
		});
	}

	// Body points removed - names will only form wings

	return arcLengthResample(raw, FINAL);
})();
