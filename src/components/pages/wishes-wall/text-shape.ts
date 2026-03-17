/**
 * Generates evenly-spaced outline points for the "names" shape by tracing
 * each character as an explicit stroke path — no canvas, no pixel sampling,
 * no browser fonts.  Each glyph is defined as a series of line/curve commands
 * in a local 0–1 × 0–1 coordinate box (origin = bottom-left, y grows up).
 *
 * This mirrors how heart / infinity / butterfly are built: pure parametric
 * math → arc-length resampled → wall coordinate space.
 */

// ── Types ────────────────────────────────────────────────────────────────────

type Pt = { x: number; y: number };

/** A single continuous stroke: array of control commands. */
type Cmd =
	| { t: "M"; x: number; y: number }
	| { t: "L"; x: number; y: number }
	| { t: "Q"; cx: number; cy: number; x: number; y: number }
	| {
			t: "C";
			cx1: number;
			cy1: number;
			cx2: number;
			cy2: number;
			x: number;
			y: number;
	  };

/** A glyph is one or more strokes (pen lifts separate strokes). */
type Glyph = { strokes: Cmd[][]; width: number };

// ── Bezier samplers ──────────────────────────────────────────────────────────

function sampleLine(p0: Pt, p1: Pt, steps: number): Pt[] {
	const pts: Pt[] = [];
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		pts.push({ x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t });
	}
	return pts;
}

function sampleQuad(p0: Pt, cp: Pt, p1: Pt, steps: number): Pt[] {
	const pts: Pt[] = [];
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const mt = 1 - t;
		pts.push({
			x: mt * mt * p0.x + 2 * mt * t * cp.x + t * t * p1.x,
			y: mt * mt * p0.y + 2 * mt * t * cp.y + t * t * p1.y,
		});
	}
	return pts;
}

function sampleCubic(p0: Pt, cp1: Pt, cp2: Pt, p1: Pt, steps: number): Pt[] {
	const pts: Pt[] = [];
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const mt = 1 - t;
		pts.push({
			x:
				mt * mt * mt * p0.x +
				3 * mt * mt * t * cp1.x +
				3 * mt * t * t * cp2.x +
				t * t * t * p1.x,
			y:
				mt * mt * mt * p0.y +
				3 * mt * mt * t * cp1.y +
				3 * mt * t * t * cp2.y +
				t * t * t * p1.y,
		});
	}
	return pts;
}

function strokeToPoints(cmds: Cmd[], steps: number): Pt[] {
	const pts: Pt[] = [];
	let cur: Pt = { x: 0, y: 0 };
	for (const cmd of cmds) {
		if (cmd.t === "M") {
			cur = { x: cmd.x, y: cmd.y };
			pts.push({ ...cur });
		} else if (cmd.t === "L") {
			const next = { x: cmd.x, y: cmd.y };
			const seg = sampleLine(cur, next, steps);
			pts.push(...seg.slice(1));
			cur = next;
		} else if (cmd.t === "Q") {
			const cp = { x: cmd.cx, y: cmd.cy };
			const next = { x: cmd.x, y: cmd.y };
			const seg = sampleQuad(cur, cp, next, steps);
			pts.push(...seg.slice(1));
			cur = next;
		} else if (cmd.t === "C") {
			const cp1 = { x: cmd.cx1, y: cmd.cy1 };
			const cp2 = { x: cmd.cx2, y: cmd.cy2 };
			const next = { x: cmd.x, y: cmd.y };
			const seg = sampleCubic(cur, cp1, cp2, next, steps);
			pts.push(...seg.slice(1));
			cur = next;
		}
	}
	return pts;
}

// ── Glyph library ────────────────────────────────────────────────────────────
// Coordinate space: x ∈ [0, width], y ∈ [0, 1]  (y=0 bottom, y=1 top)
// Each letter is drawn as one or more strokes (continuous pen paths).
// Keep it simple: straight lines + a few quads for curves.  Readability
// matters more than perfection.

const GLYPHS: Record<string, Glyph> = {
	// ── Uppercase ─────────────────────────────────────────────────────────────
	A: {
		width: 0.7,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0.35, y: 1 },
				{ t: "L", x: 0.7, y: 0 },
			],
			[
				{ t: "M", x: 0.14, y: 0.38 },
				{ t: "L", x: 0.56, y: 0.38 },
			],
		],
	},
	B: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0, y: 1 },
				{ t: "Q", cx: 0.7, cy: 1, x: 0.6, y: 0.5 },
				{ t: "Q", cx: 0.7, cy: 0.5, x: 0.65, y: 0.5 },
				{ t: "Q", cx: 0.7, cy: 0.5, x: 0.7, y: 0.25 },
				{ t: "Q", cx: 0.7, cy: 0, x: 0, y: 0 },
				{ t: "L", x: 0.6, y: 0.5 },
			],
		],
	},
	C: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0.65, y: 0.8 },
				{ t: "Q", cx: 0.65, cy: 1, x: 0.3, y: 1 },
				{ t: "Q", cx: 0, cy: 1, x: 0, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0.65, cy: 0, x: 0.65, y: 0.2 },
			],
		],
	},
	D: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0, y: 1 },
				{ t: "Q", cx: 0.7, cy: 1, x: 0.7, y: 0.5 },
				{ t: "Q", cx: 0.7, cy: 0, x: 0, y: 0 },
			],
		],
	},
	E: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0.6, y: 1 },
				{ t: "L", x: 0, y: 1 },
				{ t: "L", x: 0, y: 0 },
				{ t: "L", x: 0.6, y: 0 },
			],
			[
				{ t: "M", x: 0, y: 0.5 },
				{ t: "L", x: 0.5, y: 0.5 },
			],
		],
	},
	F: {
		width: 0.55,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0, y: 1 },
				{ t: "L", x: 0.55, y: 1 },
			],
			[
				{ t: "M", x: 0, y: 0.5 },
				{ t: "L", x: 0.45, y: 0.5 },
			],
		],
	},
	G: {
		width: 0.7,
		strokes: [
			[
				{ t: "M", x: 0.7, y: 0.8 },
				{ t: "Q", cx: 0.7, cy: 1, x: 0.35, y: 1 },
				{ t: "Q", cx: 0, cy: 1, x: 0, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0, x: 0.35, y: 0 },
				{ t: "Q", cx: 0.7, cy: 0, x: 0.7, y: 0.3 },
				{ t: "L", x: 0.4, y: 0.3 },
			],
		],
	},
	H: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0, y: 1 },
			],
			[
				{ t: "M", x: 0.65, y: 0 },
				{ t: "L", x: 0.65, y: 1 },
			],
			[
				{ t: "M", x: 0, y: 0.5 },
				{ t: "L", x: 0.65, y: 0.5 },
			],
		],
	},
	I: {
		width: 0.15,
		strokes: [
			[
				{ t: "M", x: 0.075, y: 0 },
				{ t: "L", x: 0.075, y: 1 },
			],
		],
	},
	J: {
		width: 0.5,
		strokes: [
			[
				{ t: "M", x: 0.5, y: 1 },
				{ t: "L", x: 0.5, y: 0.2 },
				{ t: "Q", cx: 0.5, cy: 0, x: 0.25, y: 0 },
				{ t: "Q", cx: 0, cy: 0, x: 0, y: 0.2 },
			],
		],
	},
	K: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0, y: 1 },
			],
			[
				{ t: "M", x: 0.65, y: 1 },
				{ t: "L", x: 0, y: 0.5 },
				{ t: "L", x: 0.65, y: 0 },
			],
		],
	},
	L: {
		width: 0.55,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0, y: 0 },
				{ t: "L", x: 0.55, y: 0 },
			],
		],
	},
	M: {
		width: 0.8,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0, y: 1 },
				{ t: "L", x: 0.4, y: 0.35 },
				{ t: "L", x: 0.8, y: 1 },
				{ t: "L", x: 0.8, y: 0 },
			],
		],
	},
	N: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0, y: 1 },
				{ t: "L", x: 0.65, y: 0 },
				{ t: "L", x: 0.65, y: 1 },
			],
		],
	},
	O: {
		width: 0.7,
		strokes: [
			[
				{ t: "M", x: 0.35, y: 1 },
				{ t: "Q", cx: 0, cy: 1, x: 0, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0, x: 0.35, y: 0 },
				{ t: "Q", cx: 0.7, cy: 0, x: 0.7, y: 0.5 },
				{ t: "Q", cx: 0.7, cy: 1, x: 0.35, y: 1 },
			],
		],
	},
	P: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0, y: 1 },
				{ t: "Q", cx: 0.65, cy: 1, x: 0.65, y: 0.75 },
				{ t: "Q", cx: 0.65, cy: 0.5, x: 0, y: 0.5 },
			],
		],
	},
	Q: {
		width: 0.7,
		strokes: [
			[
				{ t: "M", x: 0.35, y: 1 },
				{ t: "Q", cx: 0, cy: 1, x: 0, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0, x: 0.35, y: 0 },
				{ t: "Q", cx: 0.7, cy: 0, x: 0.7, y: 0.5 },
				{ t: "Q", cx: 0.7, cy: 1, x: 0.35, y: 1 },
			],
			[
				{ t: "M", x: 0.42, y: 0.25 },
				{ t: "L", x: 0.7, y: 0 },
			],
		],
	},
	R: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0, y: 1 },
				{ t: "Q", cx: 0.65, cy: 1, x: 0.65, y: 0.75 },
				{ t: "Q", cx: 0.65, cy: 0.5, x: 0, y: 0.5 },
				{ t: "L", x: 0.65, y: 0 },
			],
		],
	},
	S: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0.6, y: 0.85 },
				{ t: "Q", cx: 0.6, cy: 1, x: 0.3, y: 1 },
				{ t: "Q", cx: 0, cy: 1, x: 0, y: 0.75 },
				{ t: "Q", cx: 0, cy: 0.5, x: 0.3, y: 0.5 },
				{ t: "Q", cx: 0.6, cy: 0.5, x: 0.6, y: 0.25 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0, cy: 0, x: 0, y: 0.15 },
			],
		],
	},
	T: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0.65, y: 1 },
			],
			[
				{ t: "M", x: 0.325, y: 1 },
				{ t: "L", x: 0.325, y: 0 },
			],
		],
	},
	U: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0, y: 0.2 },
				{ t: "Q", cx: 0, cy: 0, x: 0.325, y: 0 },
				{ t: "Q", cx: 0.65, cy: 0, x: 0.65, y: 0.2 },
				{ t: "L", x: 0.65, y: 1 },
			],
		],
	},
	V: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0.325, y: 0 },
				{ t: "L", x: 0.65, y: 1 },
			],
		],
	},
	W: {
		width: 0.85,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0.2, y: 0 },
				{ t: "L", x: 0.425, y: 0.6 },
				{ t: "L", x: 0.65, y: 0 },
				{ t: "L", x: 0.85, y: 1 },
			],
		],
	},
	X: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0.65, y: 0 },
			],
			[
				{ t: "M", x: 0.65, y: 1 },
				{ t: "L", x: 0, y: 0 },
			],
		],
	},
	Y: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0.325, y: 0.5 },
				{ t: "L", x: 0.65, y: 1 },
			],
			[
				{ t: "M", x: 0.325, y: 0.5 },
				{ t: "L", x: 0.325, y: 0 },
			],
		],
	},
	Z: {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0.65, y: 1 },
				{ t: "L", x: 0, y: 0 },
				{ t: "L", x: 0.65, y: 0 },
			],
		],
	},
	// ── lowercase (same shapes as uppercase for now — feels natural at small size)
	a: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0.6, y: 0.7 },
				{ t: "L", x: 0.6, y: 0 },
			],
			[
				{ t: "M", x: 0.6, y: 0.55 },
				{ t: "Q", cx: 0.6, cy: 0.7, x: 0.3, y: 0.7 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0, y: 0.35 },
				{ t: "Q", cx: 0, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.6, y: 0.35 },
			],
		],
	},
	b: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0, y: 0 },
			],
			[
				{ t: "M", x: 0, y: 0.55 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0.3, y: 0.7 },
				{ t: "Q", cx: 0.6, cy: 0.7, x: 0.6, y: 0.35 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0, cy: 0, x: 0, y: 0.15 },
			],
		],
	},
	c: {
		width: 0.55,
		strokes: [
			[
				{ t: "M", x: 0.55, y: 0.6 },
				{ t: "Q", cx: 0.55, cy: 0.7, x: 0.28, y: 0.7 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0, y: 0.35 },
				{ t: "Q", cx: 0, cy: 0, x: 0.28, y: 0 },
				{ t: "Q", cx: 0.55, cy: 0, x: 0.55, y: 0.1 },
			],
		],
	},
	d: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0.6, y: 1 },
				{ t: "L", x: 0.6, y: 0 },
			],
			[
				{ t: "M", x: 0.6, y: 0.55 },
				{ t: "Q", cx: 0.6, cy: 0.7, x: 0.3, y: 0.7 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0, y: 0.35 },
				{ t: "Q", cx: 0, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.6, y: 0.15 },
			],
		],
	},
	e: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 0.35 },
				{ t: "L", x: 0.6, y: 0.35 },
				{ t: "Q", cx: 0.6, cy: 0.7, x: 0.3, y: 0.7 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0, y: 0.35 },
				{ t: "Q", cx: 0, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.6, y: 0.1 },
			],
		],
	},
	f: {
		width: 0.4,
		strokes: [
			[
				{ t: "M", x: 0.15, y: 0 },
				{ t: "L", x: 0.15, y: 0.9 },
				{ t: "Q", cx: 0.15, cy: 1, x: 0.35, y: 1 },
				{ t: "L", x: 0.4, y: 1 },
			],
			[
				{ t: "M", x: 0, y: 0.55 },
				{ t: "L", x: 0.35, y: 0.55 },
			],
		],
	},
	g: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0.6, y: 0.7 },
				{ t: "L", x: 0.6, y: -0.2 },
				{ t: "Q", cx: 0.6, cy: -0.4, x: 0.3, y: -0.4 },
				{ t: "Q", cx: 0, cy: -0.4, x: 0, y: -0.2 },
			],
			[
				{ t: "M", x: 0.6, y: 0.55 },
				{ t: "Q", cx: 0.6, cy: 0.7, x: 0.3, y: 0.7 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0, y: 0.35 },
				{ t: "Q", cx: 0, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.6, y: 0.15 },
			],
		],
	},
	h: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0, y: 0 },
			],
			[
				{ t: "M", x: 0, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0.3, y: 0.7 },
				{ t: "Q", cx: 0.6, cy: 0.7, x: 0.6, y: 0.5 },
				{ t: "L", x: 0.6, y: 0 },
			],
		],
	},
	i: {
		width: 0.15,
		strokes: [
			[
				{ t: "M", x: 0.075, y: 0 },
				{ t: "L", x: 0.075, y: 0.7 },
			],
			[
				{ t: "M", x: 0.075, y: 0.85 },
				{ t: "L", x: 0.075, y: 1 },
			],
		],
	},
	j: {
		width: 0.3,
		strokes: [
			[
				{ t: "M", x: 0.2, y: 0.7 },
				{ t: "L", x: 0.2, y: -0.15 },
				{ t: "Q", cx: 0.2, cy: -0.35, x: 0, y: -0.3 },
			],
			[
				{ t: "M", x: 0.2, y: 0.85 },
				{ t: "L", x: 0.2, y: 1 },
			],
		],
	},
	k: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0, y: 0 },
			],
			[
				{ t: "M", x: 0.6, y: 0.7 },
				{ t: "L", x: 0, y: 0.35 },
				{ t: "L", x: 0.6, y: 0 },
			],
		],
	},
	l: {
		width: 0.15,
		strokes: [
			[
				{ t: "M", x: 0.075, y: 1 },
				{ t: "L", x: 0.075, y: 0 },
			],
		],
	},
	m: {
		width: 0.85,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0, y: 0.7 },
			],
			[
				{ t: "M", x: 0, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0.2, y: 0.7 },
				{ t: "Q", cx: 0.425, cy: 0.7, x: 0.425, y: 0.5 },
				{ t: "L", x: 0.425, y: 0 },
			],
			[
				{ t: "M", x: 0.425, y: 0.5 },
				{ t: "Q", cx: 0.425, cy: 0.7, x: 0.625, y: 0.7 },
				{ t: "Q", cx: 0.85, cy: 0.7, x: 0.85, y: 0.5 },
				{ t: "L", x: 0.85, y: 0 },
			],
		],
	},
	n: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0, y: 0.7 },
			],
			[
				{ t: "M", x: 0, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0.3, y: 0.7 },
				{ t: "Q", cx: 0.6, cy: 0.7, x: 0.6, y: 0.5 },
				{ t: "L", x: 0.6, y: 0 },
			],
		],
	},
	o: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0.3, y: 0.7 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0, y: 0.35 },
				{ t: "Q", cx: 0, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.6, y: 0.35 },
				{ t: "Q", cx: 0.6, cy: 0.7, x: 0.3, y: 0.7 },
			],
		],
	},
	p: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 0.7 },
				{ t: "L", x: 0, y: -0.35 },
			],
			[
				{ t: "M", x: 0, y: 0.55 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0.3, y: 0.7 },
				{ t: "Q", cx: 0.6, cy: 0.7, x: 0.6, y: 0.35 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0, cy: 0, x: 0, y: 0.15 },
			],
		],
	},
	q: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0.6, y: 0.7 },
				{ t: "L", x: 0.6, y: -0.35 },
			],
			[
				{ t: "M", x: 0.6, y: 0.55 },
				{ t: "Q", cx: 0.6, cy: 0.7, x: 0.3, y: 0.7 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0, y: 0.35 },
				{ t: "Q", cx: 0, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.6, y: 0.15 },
			],
		],
	},
	r: {
		width: 0.45,
		strokes: [
			[
				{ t: "M", x: 0, y: 0 },
				{ t: "L", x: 0, y: 0.7 },
			],
			[
				{ t: "M", x: 0, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0.2, y: 0.7 },
				{ t: "Q", cx: 0.45, cy: 0.7, x: 0.45, y: 0.5 },
			],
		],
	},
	s: {
		width: 0.5,
		strokes: [
			[
				{ t: "M", x: 0.5, y: 0.6 },
				{ t: "Q", cx: 0.5, cy: 0.7, x: 0.25, y: 0.7 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0.35, x: 0.25, y: 0.35 },
				{ t: "Q", cx: 0.5, cy: 0.35, x: 0.5, y: 0.2 },
				{ t: "Q", cx: 0.5, cy: 0, x: 0.25, y: 0 },
				{ t: "Q", cx: 0, cy: 0, x: 0, y: 0.1 },
			],
		],
	},
	t: {
		width: 0.4,
		strokes: [
			[
				{ t: "M", x: 0.2, y: 1 },
				{ t: "L", x: 0.2, y: 0.1 },
				{ t: "Q", cx: 0.2, cy: 0, x: 0.35, y: 0 },
				{ t: "L", x: 0.4, y: 0 },
			],
			[
				{ t: "M", x: 0, y: 0.7 },
				{ t: "L", x: 0.4, y: 0.7 },
			],
		],
	},
	u: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 0.7 },
				{ t: "L", x: 0, y: 0.2 },
				{ t: "Q", cx: 0, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.6, y: 0.2 },
				{ t: "L", x: 0.6, y: 0.7 },
			],
		],
	},
	v: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 0.7 },
				{ t: "L", x: 0.3, y: 0 },
				{ t: "L", x: 0.6, y: 0.7 },
			],
		],
	},
	w: {
		width: 0.8,
		strokes: [
			[
				{ t: "M", x: 0, y: 0.7 },
				{ t: "L", x: 0.2, y: 0 },
				{ t: "L", x: 0.4, y: 0.4 },
				{ t: "L", x: 0.6, y: 0 },
				{ t: "L", x: 0.8, y: 0.7 },
			],
		],
	},
	x: {
		width: 0.55,
		strokes: [
			[
				{ t: "M", x: 0, y: 0.7 },
				{ t: "L", x: 0.55, y: 0 },
			],
			[
				{ t: "M", x: 0.55, y: 0.7 },
				{ t: "L", x: 0, y: 0 },
			],
		],
	},
	y: {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 0.7 },
				{ t: "L", x: 0.3, y: 0.35 },
				{ t: "L", x: 0.6, y: 0.7 },
			],
			[
				{ t: "M", x: 0.3, y: 0.35 },
				{ t: "L", x: 0.1, y: -0.3 },
			],
		],
	},
	z: {
		width: 0.55,
		strokes: [
			[
				{ t: "M", x: 0, y: 0.7 },
				{ t: "L", x: 0.55, y: 0.7 },
				{ t: "L", x: 0, y: 0 },
				{ t: "L", x: 0.55, y: 0 },
			],
		],
	},

	// ── Digits ────────────────────────────────────────────────────────────────
	"0": {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0.325, y: 1 },
				{ t: "Q", cx: 0, cy: 1, x: 0, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0, x: 0.325, y: 0 },
				{ t: "Q", cx: 0.65, cy: 0, x: 0.65, y: 0.5 },
				{ t: "Q", cx: 0.65, cy: 1, x: 0.325, y: 1 },
			],
		],
	},
	"1": {
		width: 0.4,
		strokes: [
			[
				{ t: "M", x: 0.1, y: 0.8 },
				{ t: "L", x: 0.2, y: 1 },
				{ t: "L", x: 0.2, y: 0 },
			],
		],
	},
	"2": {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 0.8 },
				{ t: "Q", cx: 0, cy: 1, x: 0.3, y: 1 },
				{ t: "Q", cx: 0.6, cy: 1, x: 0.6, y: 0.75 },
				{ t: "Q", cx: 0.6, cy: 0.5, x: 0, y: 0 },
				{ t: "L", x: 0.6, y: 0 },
			],
		],
	},
	"3": {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0.6, y: 1 },
				{ t: "Q", cx: 0.6, cy: 0.5, x: 0.15, y: 0.5 },
				{ t: "Q", cx: 0.6, cy: 0.5, x: 0.6, y: 0.25 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0, cy: 0, x: 0, y: 0.2 },
			],
		],
	},
	"4": {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0.5, y: 0 },
				{ t: "L", x: 0.5, y: 1 },
				{ t: "L", x: 0, y: 0.4 },
				{ t: "L", x: 0.65, y: 0.4 },
			],
		],
	},
	"5": {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0.6, y: 1 },
				{ t: "L", x: 0, y: 1 },
				{ t: "L", x: 0, y: 0.55 },
				{ t: "Q", cx: 0, cy: 0.7, x: 0.3, y: 0.6 },
				{ t: "Q", cx: 0.6, cy: 0.5, x: 0.6, y: 0.3 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0, cy: 0, x: 0, y: 0.15 },
			],
		],
	},
	"6": {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0.65, y: 0.85 },
				{ t: "Q", cx: 0.65, cy: 1, x: 0.325, y: 1 },
				{ t: "Q", cx: 0, cy: 1, x: 0, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0, x: 0.325, y: 0 },
				{ t: "Q", cx: 0.65, cy: 0, x: 0.65, y: 0.25 },
				{ t: "Q", cx: 0.65, cy: 0.5, x: 0.325, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0.5, x: 0, y: 0.4 },
			],
		],
	},
	"7": {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0, y: 1 },
				{ t: "L", x: 0.6, y: 1 },
				{ t: "L", x: 0.2, y: 0 },
			],
		],
	},
	"8": {
		width: 0.6,
		strokes: [
			[
				{ t: "M", x: 0.3, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0.5, x: 0, y: 0.75 },
				{ t: "Q", cx: 0, cy: 1, x: 0.3, y: 1 },
				{ t: "Q", cx: 0.6, cy: 1, x: 0.6, y: 0.75 },
				{ t: "Q", cx: 0.6, cy: 0.5, x: 0.3, y: 0.5 },
				{ t: "Q", cx: 0, cy: 0.5, x: 0, y: 0.25 },
				{ t: "Q", cx: 0, cy: 0, x: 0.3, y: 0 },
				{ t: "Q", cx: 0.6, cy: 0, x: 0.6, y: 0.25 },
				{ t: "Q", cx: 0.6, cy: 0.5, x: 0.3, y: 0.5 },
			],
		],
	},
	"9": {
		width: 0.65,
		strokes: [
			[
				{ t: "M", x: 0, y: 0.15 },
				{ t: "Q", cx: 0, cy: 0, x: 0.325, y: 0 },
				{ t: "Q", cx: 0.65, cy: 0, x: 0.65, y: 0.5 },
				{ t: "Q", cx: 0.65, cy: 1, x: 0.325, y: 1 },
				{ t: "Q", cx: 0, cy: 1, x: 0, y: 0.75 },
				{ t: "Q", cx: 0, cy: 0.5, x: 0.325, y: 0.5 },
				{ t: "Q", cx: 0.65, cy: 0.5, x: 0.65, y: 0.6 },
			],
		],
	},

	// ── Punctuation / special ──────────────────────────────────────────────────
	"&": {
		width: 0.75,
		strokes: [
			[
				{ t: "M", x: 0.55, y: 0.7 },
				{ t: "Q", cx: 0.55, cy: 1, x: 0.3, y: 1 },
				{ t: "Q", cx: 0, cy: 1, x: 0, y: 0.75 },
				{ t: "Q", cx: 0, cy: 0.55, x: 0.35, y: 0.45 },
				{ t: "L", x: 0.2, y: 0.3 },
				{ t: "Q", cx: 0, cy: 0.1, x: 0.15, y: 0 },
				{ t: "Q", cx: 0.35, cy: -0.05, x: 0.55, y: 0.2 },
				{ t: "L", x: 0.75, y: 0.45 },
			],
			[
				{ t: "M", x: 0.35, y: 0.45 },
				{ t: "Q", cx: 0.2, cy: 0.35, x: 0.2, y: 0.3 },
			],
		],
	},
	" ": { width: 0.4, strokes: [] },
	"-": {
		width: 0.4,
		strokes: [
			[
				{ t: "M", x: 0, y: 0.5 },
				{ t: "L", x: 0.4, y: 0.5 },
			],
		],
	},
	"'": {
		width: 0.2,
		strokes: [
			[
				{ t: "M", x: 0.1, y: 1 },
				{ t: "L", x: 0.1, y: 0.75 },
			],
		],
	},
	".": {
		width: 0.2,
		strokes: [
			[
				{ t: "M", x: 0.1, y: 0.05 },
				{ t: "L", x: 0.1, y: 0.1 },
			],
		],
	},
};

// ── Arc-length resampler (lerp version) ──────────────────────────────────────

function arcResample(pts: Pt[], count: number): Pt[] {
	if (pts.length < 2) {
		// fallback: horizontal line
		return Array.from({ length: count }, (_, i) => ({
			x: 10 + (i / count) * 80,
			y: 50,
		}));
	}
	const cumLen: number[] = [0];
	for (let i = 1; i < pts.length; i++) {
		const dx = pts[i].x - pts[i - 1].x;
		const dy = pts[i].y - pts[i - 1].y;
		cumLen.push(cumLen[i - 1] + Math.sqrt(dx * dx + dy * dy));
	}
	const totalLen = cumLen[pts.length - 1];
	const result: Pt[] = [];
	let ri = 0;
	for (let s = 0; s < count; s++) {
		const target = (s / count) * totalLen;
		while (ri < pts.length - 2 && cumLen[ri + 1] < target) ri++;
		const segLen = cumLen[ri + 1] - cumLen[ri];
		const t = segLen > 0 ? (target - cumLen[ri]) / segLen : 0;
		const a = pts[ri];
		const b = pts[ri + 1] ?? pts[ri];
		result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
	}
	return result;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Produces `count` evenly arc-spaced points that trace the stroke outlines of
 * `text` in wall coordinate space (x,y ∈ [0,100]).  Works in SSR and browser.
 */
export function getTextShapePoints(
	text: string,
	count: number,
): Array<{ x: number; y: number }> {
	const safeText = (text.trim() || "Bride & Groom").toUpperCase();

	// ── 1. Lay out glyphs left→right, collect raw stroke points ───────────────
	const STEPS = 12; // curve subdivisions per segment
	const LETTER_SPACING = 0.1; // extra gap between glyphs (in glyph-height units)

	// First pass: measure total width
	let totalW = 0;
	for (const ch of safeText) {
		const g = GLYPHS[ch] ?? GLYPHS[ch.toUpperCase()];
		if (g) totalW += g.width + LETTER_SPACING;
	}
	totalW = Math.max(totalW - LETTER_SPACING, 0.01);

	// Second pass: emit points
	const raw: Pt[] = [];
	let cursorX = 0;
	for (const ch of safeText) {
		const g = GLYPHS[ch] ?? GLYPHS[ch.toUpperCase()];
		if (!g) {
			cursorX += 0.4 + LETTER_SPACING; // unknown char → space
			continue;
		}
		for (const stroke of g.strokes) {
			const localPts = strokeToPoints(stroke, STEPS);
			for (const p of localPts) {
				raw.push({ x: (cursorX + p.x) / totalW, y: p.y });
			}
		}
		cursorX += g.width + LETTER_SPACING;
	}

	if (raw.length === 0) {
		return Array.from({ length: count }, (_, i) => ({
			x: 10 + (i / count) * 80,
			y: 50,
		}));
	}

	// ── 2. Map raw [0,1]×[0,1] → wall coordinate space ────────────────────────
	// x: fill [10, 90], y: centered at 50, height = 40% of wall (±20 units)
	const wallLeft = 10;
	const wallRight = 90;
	const wallMidY = 50;
	const wallHalfH = 20;

	const mapped = raw.map((p) => ({
		x: wallLeft + p.x * (wallRight - wallLeft),
		// glyph y=0 is bottom, y=1 is top → flip for screen (y grows down)
		y: wallMidY + (0.5 - p.y) * wallHalfH * 2,
	}));

	// ── 3. Arc-length resample to exactly `count` evenly-spaced points ────────
	return arcResample(mapped, count);
}
