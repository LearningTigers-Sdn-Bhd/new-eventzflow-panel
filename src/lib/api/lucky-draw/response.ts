// Response types for Lucky Draw API

export type GiftPick = "in_order" | "random";

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
	scanned_only: boolean;
	scanned_from: string | null;
	scanned_to: string | null;
	scanned_source: "ticket" | "scan_log" | "entries";
	winners_per_draw: number;
	/** How the next gift is chosen when gifts are on */
	gift_pick: GiftPick;
	/** One click gives every open gift one winner (a round) */
	round_sweep: boolean;
	/** Ticket types left out of the draw pool */
	excluded_ticket_type_ids: number[];
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
	/** Sweep round that drew this winner. null when drawn gift by gift */
	round: number | null;
	/** Set when the winner did not show up: no longer counts toward the gift */
	voided_at: string | null;
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
	/** Held back until every other gift is done (the grand prize) */
	draw_last: boolean;
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
	/** Draw this winner came from (gifts off). null for winners saved before rounds existed. */
	round: number | null;
	/** Set when the winner did not show up. They stay out of the pool. */
	voided_at: string | null;
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

/**
 * Lucky Draw Entry (a ticket scanned in for this draw)
 */
export interface LuckyDrawEntry {
	id: number;
	participant_id: number;
	name: string;
	entered_at: string;
}
