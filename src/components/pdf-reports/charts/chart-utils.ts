"use client";

import { colors } from "../styles";

/**
 * Calculate nice Y-axis tick values
 */
export function calculateYTicks(maxValue: number, tickCount: number): number[] {
	if (maxValue === 0) return [0];

	const rawInterval = maxValue / (tickCount - 1);
	const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
	const normalized = rawInterval / magnitude;

	let niceInterval: number;
	if (normalized <= 1) niceInterval = 1;
	else if (normalized <= 2) niceInterval = 2;
	else if (normalized <= 5) niceInterval = 5;
	else niceInterval = 10;

	niceInterval *= magnitude;

	const ticks: number[] = [];
	for (let i = 0; i <= Math.ceil(maxValue / niceInterval); i++) {
		ticks.push(i * niceInterval);
	}

	return ticks.slice(0, tickCount + 1);
}

/**
 * Format Y-axis value (e.g., 1000 -> 1k)
 */
export function formatYValue(value: number): string {
	if (value >= 1000) {
		return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
	}
	return value.toString();
}

/**
 * Format date for X-axis (e.g., "1-2" for Feb 1)
 */
export function formatAxisDate(dateStr: string): string {
	try {
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return dateStr;
		return `${date.getDate()}-${date.getMonth() + 1}`;
	} catch {
		return dateStr;
	}
}

/**
 * Format date label for bar charts
 */
export function formatDateLabel(dateStr: string): string {
	try {
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return dateStr;
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	} catch {
		return dateStr;
	}
}

/**
 * Format hour to 12-hour format
 */
export function formatHourTo12h(hourStr: string): string {
	const hour = parseInt(hourStr.split(":")[0], 10);
	if (hour === 0) return "12A";
	if (hour === 12) return "12P";
	if (hour < 12) return `${hour}A`;
	return `${hour - 12}P`;
}

/**
 * Format hour to 12-hour format with AM/PM
 */
export function formatHourTo12hFull(hourStr: string): string {
	const hour = parseInt(hourStr.split(":")[0], 10);
	if (hour === 0) return "12AM";
	if (hour === 12) return "12PM";
	if (hour < 12) return `${hour}AM`;
	return `${hour - 12}PM`;
}

/**
 * Create monotone cubic path that doesn't overshoot (no dips below baseline)
 * Uses Fritsch-Carlson method for monotone interpolation
 * @param points Array of points
 * @param maxY Optional maximum Y value (baseline) - curve won't go beyond this
 */
export function createSmoothPath(points: { x: number; y: number }[], maxY?: number): string {
	if (points.length < 2) return "";
	if (points.length === 2) {
		return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
	}

	// Calculate slopes between points
	const n = points.length;
	const slopes: number[] = [];

	for (let i = 0; i < n - 1; i++) {
		const dx = points[i + 1].x - points[i].x;
		const dy = points[i + 1].y - points[i].y;
		slopes.push(dx === 0 ? 0 : dy / dx);
	}

	// Calculate tangents using monotone method
	const tangents: number[] = [];
	tangents.push(slopes[0]);

	for (let i = 1; i < n - 1; i++) {
		const s0 = slopes[i - 1];
		const s1 = slopes[i];

		// If slopes have different signs or either is zero, tangent is zero (local extremum)
		if (s0 * s1 <= 0) {
			tangents.push(0);
		} else {
			// Use harmonic mean for monotonicity
			tangents.push(2 / (1 / s0 + 1 / s1));
		}
	}
	tangents.push(slopes[n - 2]);

	// Build path with cubic bezier curves
	let path = `M ${points[0].x} ${points[0].y}`;

	for (let i = 0; i < n - 1; i++) {
		const p0 = points[i];
		const p1 = points[i + 1];
		const dx = (p1.x - p0.x) / 3;

		const cp1x = p0.x + dx;
		let cp1y = p0.y + tangents[i] * dx;
		const cp2x = p1.x - dx;
		let cp2y = p1.y - tangents[i + 1] * dx;

		// Clamp control points to not exceed baseline
		if (maxY !== undefined) {
			cp1y = Math.min(cp1y, maxY);
			cp2y = Math.min(cp2y, maxY);
		}

		path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
	}

	return path;
}

/**
 * Create smooth area path with closed bottom
 */
export function createSmoothAreaPath(
	points: { x: number; y: number }[],
	baselineY: number,
): string {
	if (points.length < 2) return "";

	// Pass baselineY to clamp the curve from going below baseline
	const linePath = createSmoothPath(points, baselineY);
	const lastPoint = points[points.length - 1];
	const firstPoint = points[0];

	return `${linePath} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`;
}
