// Response types for Lucky Draw API

/**
 * Lucky Draw Session
 */
export interface LuckyDrawSession {
	id: number;
	event_id: number;
	title: string;
	draw_date: string | null;
	logo_url: string | null;
	draw_styles: {
		style: "wheel" | "slot" | "box";
		theme: "wireframe" | "colorful" | "cartoon";
	};
	wrapper_background: {
		useImage: boolean;
		backgroundImgUrl?: string;
		backgroundColor?: string;
	};
	use_gifts: boolean;
	created_at: string;
	updated_at: string;
}

/**
 * Gift Winner
 */
export interface GiftWinner {
	id: number;
	gift_id: number;
	ticket_id: number | null;
	visitor_id: number | null;
	participant_name: string | null;
	drawn_at: string;
	created_at: string;
	updated_at: string;
}

/**
 * Gift
 */
export interface Gift {
	id: number;
	lucky_draw_session_id: number;
	name: string;
	order: number;
	winner_counts: number;
	winners: GiftWinner[];
	created_at: string;
	updated_at: string;
}

/**
 * Participant
 */
export interface Participant {
	id: number;
	name: string;
}

/**
 * Invalid Participant
 */
export interface InvalidParticipant {
	id: number;
	lucky_draw_session_id: number;
	participant: {
		id: number;
		name: string;
	};
	created_at: string;
	updated_at: string;
}

/**
 * Standard API Response wrapper
 */
export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data?: T;
	meta?: object;
}
