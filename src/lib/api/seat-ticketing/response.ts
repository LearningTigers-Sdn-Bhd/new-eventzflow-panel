export interface EventSeatSession {
	id: number;
	event_id: number;
	name: string;
	status: string;
	public_id?: string;
	slug?: string;
	location: string | null;
	start_datetime: string | null;
	end_datetime: string | null;
	created_at: string;
	updated_at: string;
	deleted_at?: string | null;
	archived?: boolean;
	event_seat_venues?: EventSeatVenue[];
}

export interface EventSeatVenue {
	id: number;
	event_seat_session_id: number;
	name: string;
	total_row: number | null;
	total_column: number | null;
	aspect_ratio?: "video" | "square" | "4:3" | null;
	image?: File | null;
	image_url?: string | null;
	created_at: string;
	updated_at: string;
	event_seat_sections?: EventSeatSection[];
}

export interface EventSeatSection {
	id: number;
	event_seat_venue_id: number;
	name: string;
	price: string | number | null;
	start_row: number | null;
	start_column: number | null;
	seat_row: number | null;
	seat_column: number | null;
	row_span: number | null;
	col_span: number | null;
	created_at: string;
	updated_at: string;
	event_ticket_seats?: EventTicketSeat[];
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
