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
	name?: string;
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
	seats_count?: number;
	ticket_seat_counts?: {
		total: number;
		available: number;
	};
	visitor_seat_counts?: {
		total: number;
		available: number;
	};
	start_row: number | null;
	start_column: number | null;
	seat_row: number | null;
	seat_column: number | null;
	row_span: number | null;
	col_span: number | null;
	rotation?: number | null;
	color?: string | null;
	blueprint_config?: BlueprintConfig | null;
	created_at: string;
	updated_at: string;
	event_ticket_seats?: EventTicketSeat[];
	event_seat_groups?: EventSeatGroup[];
}

export interface BlueprintConfig {
	row_blocks?: number[];
	col_blocks?: number[];
	row_gap?: number;
	col_gap?: number;
	exclusions?: { r: number; c: number }[];
}

export interface EventSeatGroup {
	id: number;
	event_seat_section_id: number;
	name: string;
	extra_price: string | number | null;
	color?: string | null;
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
	visitor_id: number | null;
	locked_at: string | null;
	locked_by_session_id?: string | null;
	status?: "available" | "locked" | "sold";
	created_at: string;
	updated_at: string;
	event_seat_group_assignment?: EventSeatGroupAssignment | null;
}

export interface EventSeatGroupAssignment {
	id: number;
	event_seat_group_id: number;
	event_ticket_seat_id: number;
}

export interface EventSeatCheckoutSession {
	id: string;
	event_seat_session_id: number;
	updated_at: string;
	expires_at: string;
}
