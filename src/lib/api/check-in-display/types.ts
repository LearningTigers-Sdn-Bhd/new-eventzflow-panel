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
	voice_enabled: boolean;
	voice_type: string;
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
	voice_enabled?: boolean;
	voice_type?: string;
}

export interface CheckInBroadcast {
	name: string;
	checked_in_at: string;
}

export interface WelcomeScreenStateMessage {
	type: "state";
	name: string | null;
	remaining_ms: number;
	queue_size: number;
}

export interface WelcomeScreenDisplayMessage {
	type: "display";
	name: string;
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
