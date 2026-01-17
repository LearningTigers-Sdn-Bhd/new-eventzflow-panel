/**
 * Color mappings for draw styles and themes
 * Used across roulette and lucky-draw components
 */

export type DrawStyle = "wheel" | "slot" | "box";
export type DrawTheme = "wireframe" | "colorful" | "cartoon";

/**
 * Style color mappings for badges (without border)
 * Used in table columns
 */
export const styleColors: Record<string, string> = {
	wheel: "bg-blue-500 text-white",
	slot: "bg-purple-500 text-white",
	box: "bg-orange-500 text-white",
};

/**
 * Theme color mappings for badges (without border)
 * Used in table columns
 */
export const themeColors: Record<string, string> = {
	wireframe: "bg-gray-500 text-white",
	colorful: "bg-pink-500 text-white",
	cartoon: "bg-yellow-500 text-white",
};

/**
 * Style color mappings for badges (with border)
 * Used in session item cards
 */
export const styleColorsWithBorder: Record<string, string> = {
	wheel: "bg-blue-500 text-white border-blue-600",
	slot: "bg-purple-500 text-white border-purple-600",
	box: "bg-orange-500 text-white border-orange-600",
};

/**
 * Theme color mappings for badges (with border)
 * Used in session item cards
 */
export const themeColorsWithBorder: Record<string, string> = {
	wireframe: "bg-gray-500 text-white border-gray-600",
	colorful: "bg-pink-500 text-white border-pink-600",
	cartoon: "bg-yellow-500 text-white border-yellow-600",
};

/**
 * Get style color class name
 */
export function getStyleColor(style: string, withBorder = false): string {
	const colors = withBorder ? styleColorsWithBorder : styleColors;
	return colors[style] || "bg-gray-500 text-white";
}

/**
 * Get theme color class name
 */
export function getThemeColor(theme: string, withBorder = false): string {
	const colors = withBorder ? themeColorsWithBorder : themeColors;
	return colors[theme] || "bg-gray-500 text-white";
}
