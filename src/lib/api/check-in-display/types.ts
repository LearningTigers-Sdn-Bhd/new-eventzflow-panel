export type AnimationType =
	| "fade_in"
	| "slide_up"
	| "zoom_in"
	| "bounce"
	| "typewriter"
	| "no_animation";

export type DisplayMode = "image" | "video";

export interface CheckInDisplay {
	id: string;
	font_family: string;
	font_size: number;
	animation_type: AnimationType;
	is_bold: boolean;
	name_color: string;
	voice_enabled: boolean;
	voice_type: string; // Google Cloud TTS voice ID
	welcome_text: string;
	
	// Modes
	idle_mode: DisplayMode;
	announcement_mode: DisplayMode;
	announcement_duration: number; // in milliseconds

	// Seating Plan
	show_seating_plan: boolean;
	seating_plan_sidebar_position: "left" | "right";
	seating_plan_duration: number; // in milliseconds
	active_plan_id?: number | null;
	seating_announcement_template?: string | null;

	// // Photo Booth
	// photo_booth_enabled: boolean;
	// photo_booth_countdown: number;
	// photo_booth_webhook_url: string | null;

	// URLs
	background_image_url: string | null;
	idle_video_url: string | null;
	announcement_image_url: string | null;
	announcement_video_url: string | null;
	// branding_frame_url: string | null;

	event: {
		id: string;
		title: string;
		slug: string;
		webhook_url?: string | null;
	};
}

export interface CheckInDisplayFormData {
	font_family: string;
	font_size: number;
	animation_type: AnimationType;
	is_bold: boolean;
	name_color: string;
	voice_enabled?: boolean;
	voice_type?: string;
	welcome_text?: string;

	idle_mode?: string;
	announcement_mode?: string;
	announcement_duration?: number;

	show_seating_plan?: boolean;
	seating_plan_sidebar_position?: "left" | "right";
	seating_plan_duration?: number;
	active_plan_id?: number | null;
	seating_announcement_template?: string;

	// // Photo Booth
	// photo_booth_enabled?: boolean;
	// photo_booth_countdown?: number;
	// photo_booth_webhook_url?: string;

	// Files
	background_image?: File;
	idle_video?: File;
	announcement_image?: File;
	announcement_video?: File;
	// branding_frame?: File;

	// Removal flags
	remove_background_image?: boolean;
	remove_idle_video?: boolean;
	remove_announcement_image?: boolean;
	remove_announcement_video?: boolean;
	// remove_branding_frame?: boolean;
}

export interface SeatingContext {
	plan_id: number;
	table_id: number;
	table_label: string;
	table_guests: Array<{ name: string; is_checked_in: boolean }>;
}

export interface CheckInBroadcast {
	name: string;
	table_label?: string | null;
	seating_context?: SeatingContext;
	checked_in_at: string;
}

export interface AnnounceGuestResponse {
	message: string;
	name: string;
}

export interface WelcomeScreenStateMessage {
	type: "state";
	name: string | null;
	table_label?: string | null;
	seating_context?: SeatingContext;
	remaining_ms: number;
	queue_size: number;
}

export interface WelcomeScreenDisplayMessage {
	type: "display";
	name: string;
	table_label?: string | null;
	seating_context?: SeatingContext;
	display_duration_ms: number;
	checked_in_at: string;
}

export interface WelcomeScreenQueueUpdateMessage {
	type: "queue_update";
	queue_size: number;
}

export interface WelcomeScreenClearMessage {
	type: "clear";
}

export type WelcomeScreenMessage =
	| WelcomeScreenStateMessage
	| WelcomeScreenDisplayMessage
	| WelcomeScreenQueueUpdateMessage
	| WelcomeScreenClearMessage;
