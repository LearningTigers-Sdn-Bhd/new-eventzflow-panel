/**
 * Check-In Display API Types
 */

export type AnimationType =
	| "fade_in"
	| "slide_up"
	| "zoom_in"
	| "bounce"
	| "typewriter"
	| "no_animation";

export interface CheckInDisplay {
	id: string;
	font_family: string;
	font_size: number;
	animation_type: AnimationType;
	is_bold: boolean;
	name_color: string;
	background_image_url: string | null;
	event: {
		id: string;
		title: string;
		slug: string;
	};
}

export interface CheckInDisplayFormData {
	font_family: string;
	font_size: number;
	animation_type: AnimationType;
	is_bold: boolean;
	name_color: string;
	background_image?: File;
	remove_background_image?: boolean;
}

export interface CheckInBroadcast {
	name: string;
	checked_in_at: string;
}
