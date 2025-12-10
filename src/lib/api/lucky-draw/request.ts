// Request types for Lucky Draw API

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
	// Logo is handled via FormData
}

/**
 * Create Gift Request
 */
export interface CreateGiftRequest {
	name: string;
	order?: number;
	winner_counts?: number;
}

/**
 * Update Gift Request
 */
export interface UpdateGiftRequest {
	name?: string;
	order?: number;
	winner_counts?: number;
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
