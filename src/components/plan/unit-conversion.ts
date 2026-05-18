export type Unit = "m" | "ft";

export const PIXELS_PER_METER = 50;
export const METERS_TO_FEET = 3.28084;

export function pxToMeters(px: number): number {
	return px / PIXELS_PER_METER;
}

export function metersToPx(m: number): number {
	return m * PIXELS_PER_METER;
}

export function metersToFeet(m: number): number {
	return m * METERS_TO_FEET;
}

export function feetToMeters(ft: number): number {
	return ft / METERS_TO_FEET;
}

export function pxToUnit(px: number, unit: Unit): number {
	const meters = pxToMeters(px);
	const value = unit === "m" ? meters : metersToFeet(meters);
	return Math.round(value * 100) / 100;
}

export function unitToPx(value: number, unit: Unit): number {
	const meters = unit === "m" ? value : feetToMeters(value);
	return metersToPx(meters);
}

export function formatUnit(value: number, unit: Unit): string {
	return `${value.toFixed(2)}${unit}`;
}
