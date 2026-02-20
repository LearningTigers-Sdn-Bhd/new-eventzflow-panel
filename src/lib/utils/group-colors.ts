export const VIBRANT_COLORS = [
	"red",
	"orange",
	"amber",
	"yellow",
	"lime",
	"green",
	"emerald",
	"teal",
	"cyan",
	"sky",
	"blue",
	"indigo",
	"violet",
	"purple",
	"fuchsia",
	"pink",
	"rose",
];

export const COLOR_SHADES: Record<string, { 200: string; 500: string; 700: string }> =
	{
		red: { 200: "#fecaca", 500: "#ef4444", 700: "#b91c1c" },
		orange: { 200: "#fed7aa", 500: "#f97316", 700: "#c2410c" },
		amber: { 200: "#fde68a", 500: "#f59e0b", 700: "#b45309" },
		yellow: { 200: "#fef08a", 500: "#eab308", 700: "#a16207" },
		lime: { 200: "#d9f99d", 500: "#84cc16", 700: "#4d7c0f" },
		green: { 200: "#bbf7d0", 500: "#22c55e", 700: "#15803d" },
		emerald: { 200: "#a7f3d0", 500: "#10b981", 700: "#047857" },
		teal: { 200: "#99f6e4", 500: "#14b8a6", 700: "#0f766e" },
		cyan: { 200: "#a5f3fc", 500: "#06b6d4", 700: "#0e7490" },
		sky: { 200: "#bae6fd", 500: "#0ea5e9", 700: "#0369a1" },
		blue: { 200: "#bfdbfe", 500: "#3b82f6", 700: "#1d4ed8" },
		indigo: { 200: "#c7d2fe", 500: "#6366f1", 700: "#4338ca" },
		violet: { 200: "#ddd6fe", 500: "#8b5cf6", 700: "#6d28d9" },
		purple: { 200: "#e9d5ff", 500: "#a855f7", 700: "#7e22ce" },
		fuchsia: { 200: "#f5d0fe", 500: "#d946ef", 700: "#a21caf" },
		pink: { 200: "#fbcfe8", 500: "#ec4899", 700: "#be185d" },
		rose: { 200: "#fecdd3", 500: "#f43f5e", 700: "#be123c" },
		slate: { 200: "#e2e8f0", 500: "#64748b", 700: "#334155" },
	};

export function getGroupColorHex(colorName: string | undefined | null, shade: 200 | 500 | 700 = 500) {
	const name = colorName || "blue";
	const shades = COLOR_SHADES[name] || COLOR_SHADES.blue;
	return shades[shade];
}

export function getGroupColor(colorName: string | undefined | null) {
	if (!colorName) return "bg-slate-300";

	// Use 600 for vibrant colors, 300 for neutral/gray colors
	const shade = VIBRANT_COLORS.includes(colorName) ? "600" : "300";
	return `bg-${colorName}-${shade}`;
}

export function getSectionShades(colorName: string | undefined | null) {
	const name = colorName || "blue";
	return COLOR_SHADES[name] || COLOR_SHADES.blue;
}
