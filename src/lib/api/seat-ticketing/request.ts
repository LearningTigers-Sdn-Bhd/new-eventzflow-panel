export interface GetSeatSessionsRequest {
	eventId?: string;
	archived?: boolean;
	full?: boolean;
}

export interface GetSeatSessionRequest {
	sessionId: string;
}

export interface CreateSeatSessionRequest {
	event_id: number;
	name: string;
	status?: number | "draft" | "published" | "cancelled";
	location?: string | null;
	start_datetime?: string | null;
	end_datetime?: string | null;
}

export interface UpdateSeatSessionRequest {
	name?: string;
	status?: number | "draft" | "published" | "cancelled";
	location?: string | null;
	start_datetime?: string | null;
	end_datetime?: string | null;
}

export interface GetSeatVenuesRequest {
	sessionId: string;
}

export interface CreateSeatVenueRequest {
	name: string;
	row?: number | null;
	column?: number | null;
	image?: File | null;
}

export interface UpdateSeatVenueRequest {
	name?: string;
	row?: number | null;
	column?: number | null;
	image?: File | null;
}

export interface GetSeatSectionsRequest {
	sessionId: string;
	venueId: string;
}

export interface CreateSeatSectionRequest {
	name: string;
	prize?: number | string | null;
	seat_row?: number | null;
	seat_column?: number | null;
	row_span?: number | null;
	col_span?: number | null;
}

export interface UpdateSeatSectionRequest {
	name?: string;
	prize?: number | string | null;
	seat_row?: number | null;
	seat_column?: number | null;
	row_span?: number | null;
	col_span?: number | null;
}

export interface GetEventTicketSeatsRequest {
	sessionId: string;
	venueId: string;
	sectionId: string;
}

export interface CreateEventTicketSeatRequest {
	name: string;
	extra_price?: number | string | null;
	row_set?: number | null;
	col_set?: number | null;
	ticket_id?: number | null;
}

export interface UpdateEventTicketSeatRequest {
	name?: string;
	extra_price?: number | string | null;
	row_set?: number | null;
	col_set?: number | null;
	ticket_id?: number | null;
}
