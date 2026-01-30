export interface EventSeatSession {
	id: number;
	event_id: number;
	name: string;
	status: string;
	location: string | null;
	start_datetime: string | null;
	end_datetime: string | null;
	created_at: string;
	updated_at: string;
	deleted_at?: string | null;
	archived?: boolean;
}

export interface EventSeatVenue {
	id: number;
	event_seat_session_id: number;
	name: string;
	row: number | null;
	column: number | null;
	image_url?: string | null;
	created_at: string;
	updated_at: string;
}

export interface EventSeatSection {
	id: number;
	event_seat_venue_id: number;
	name: string;
	prize: string | number | null;
	seat_row: number | null;
	seat_column: number | null;
	row_span: number | null;
	col_span: number | null;
	created_at: string;
	updated_at: string;
}

export interface EventTicketSeat {
	id: number;
	event_seat_section_id: number;
	name: string;
	extra_price: string | number | null;
	row_set: number | null;
	col_set: number | null;
	ticket_id: number | null;
	created_at: string;
	updated_at: string;
}
