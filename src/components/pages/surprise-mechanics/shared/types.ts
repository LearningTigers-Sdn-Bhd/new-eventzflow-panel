/**
 * Shared type definitions for surprise mechanics (roulette and lucky-draw)
 */

export type DrawStyle = "wheel" | "slot" | "box";
export type DrawTheme = "wireframe" | "colorful" | "cartoon";

/**
 * Base session interface with common fields
 */
export interface BaseSession {
	id: number;
	title: string;
	draw_date: string | null;
	logo_url: string | null;
	draw_styles: {
		style: DrawStyle;
		theme: DrawTheme;
	} | null;
}

/**
 * Badge configuration for session items
 */
export type SessionBadgeConfig =
	| {
			type: "multiple";
			value: boolean;
			label: string;
	  }
	| {
			type: "gifts";
			value: boolean;
			label: string;
	  };
