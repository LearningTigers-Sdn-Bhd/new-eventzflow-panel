// Request types for Lucky Draw API

import type { GiftPick } from "./response";

/**
 * Create Lucky Draw Session Request
 */
export interface CreateLuckyDrawSessionRequest {
	title: string;
	draw_date?: string | null;
	draw_styles?: {
		style: "wheel" | "slot" | "box";
		theme: "wireframe" | "colorful" | "cartoon";
	};
	wrapper_background?: {
		useImage: boolean;
		backgroundImgUrl?: string;
		backgroundColor?: string;
	};
	use_gifts?: boolean;
	scanned_only?: boolean;
	scanned_from?: string | null;
	scanned_to?: string | null;
	scanned_source?: "ticket" | "scan_log" | "entries";
	winners_per_draw?: number;
	gift_pick?: GiftPick;
	round_sweep?: boolean;
	/** Ticket type ids left out of the draw pool */
	excluded_ticket_type_ids?: string[];
	// Logo is handled via FormData
}

/**
 * Update Lucky Draw Session Request
 */
export interface UpdateLuckyDrawSessionRequest {
	title?: string;
	draw_date?: string | null;
	draw_styles?: {
		style: "wheel" | "slot" | "box";
		theme: "wireframe" | "colorful" | "cartoon";
	};
	wrapper_background?: {
		useImage: boolean;
		backgroundImgUrl?: string;
		backgroundColor?: string;
	};
	use_gifts?: boolean;
	scanned_only?: boolean;
	scanned_from?: string | null;
	scanned_to?: string | null;
	scanned_source?: "ticket" | "scan_log" | "entries";
	winners_per_draw?: number;
	gift_pick?: GiftPick;
	round_sweep?: boolean;
	/** Ticket type ids left out of the draw pool */
	excluded_ticket_type_ids?: string[];
	// Logo is handled via FormData
}

/**
 * Create Gift Request
 */
export interface CreateGiftRequest {
	name: string;
	order?: number;
	winner_counts?: number;
	draw_last?: boolean;
}

/**
 * Update Gift Request
 */
export interface UpdateGiftRequest {
	name?: string;
	order?: number;
	winner_counts?: number;
	draw_last?: boolean;
}

/**
 * Sweep Assign Winners Request: one draw round, each winner for its own gift
 */
export interface SweepAssignWinnersRequest {
	winners: Array<{
		gift_id: number;
		ticket_id?: number;
		visitor_id?: number;
	}>;
}

/**
 * Assign Winner Request
 * Exactly one of ticket_id or visitor_id must be provided
 */
export interface AssignWinnerRequest {
	ticket_id?: number;
	visitor_id?: number;
}

/**
 * Bulk Assign Winners Request
 */
export interface BulkAssignWinnersRequest {
	winners: Array<{
		ticket_id?: number;
		visitor_id?: number;
	}>;
}

/**
 * Add Invalid Participant Request
 * Exactly one of ticket_id or visitor_id must be provided
 */
export interface AddInvalidParticipantRequest {
	ticket_id?: number;
	visitor_id?: number;
}

/**
 * Get Participants Query Parameters
 */
export interface GetParticipantsQuery {
	type?: "ticket" | "visitor";
	exclude_winners?: boolean;
	exclude_invalid?: boolean;
}
