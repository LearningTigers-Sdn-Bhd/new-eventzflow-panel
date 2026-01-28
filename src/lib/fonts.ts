/**
 * Welcome Screen Fonts Configuration
 * Add new fonts here - they will be automatically available in the dropdown
 * and loaded via Google Fonts
 */

export interface FontConfig {
	name: string;
	/** Google Fonts family name (if different from display name) */
	googleFontName?: string;
	/** Set to true for system fonts that don't need to be loaded */
	isSystemFont?: boolean;
}

/**
 * Available fonts for the welcome screen
 * To add a new font:
 * 1. Add it to this array
 * 2. Make sure the googleFontName matches Google Fonts exactly
 */
export const WELCOME_SCREEN_FONTS: FontConfig[] = [
	{ name: "Inter", googleFontName: "Inter" },
	{ name: "Roboto", googleFontName: "Roboto" },
	{ name: "Open Sans", googleFontName: "Open+Sans" },
	{ name: "Lato", googleFontName: "Lato" },
	{ name: "Montserrat", googleFontName: "Montserrat" },
	{ name: "Poppins", googleFontName: "Poppins" },
	{ name: "Playfair Display", googleFontName: "Playfair+Display" },
	{ name: "Bebas Neue", googleFontName: "Bebas+Neue" },
	{ name: "Space Grotesk", googleFontName: "Space+Grotesk" },
	{ name: "Great Vibes", googleFontName: "Great+Vibes" },
	{ name: "Arial", isSystemFont: true },
	{ name: "Georgia", isSystemFont: true },
	{ name: "Times New Roman", isSystemFont: true },
];

/**
 * Get list of font names for dropdowns
 */
export function getFontNames(): string[] {
	return WELCOME_SCREEN_FONTS.map((font) => font.name);
}

/**
 * Generate Google Fonts URL for all non-system fonts
 * Loads both regular (400) and bold (700) weights
 */
export function getGoogleFontsUrl(): string {
	const googleFonts = WELCOME_SCREEN_FONTS.filter(
		(font) => !font.isSystemFont && font.googleFontName,
	);

	if (googleFonts.length === 0) return "";

	const families = googleFonts
		.map((font) => `family=${font.googleFontName}:wght@400;700`)
		.join("&");

	return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/**
 * Default font for welcome screen
 */
export const DEFAULT_FONT = "Inter";
