// Backend user type (from Rails API)
export type BackendUser = {
	id: number;
	full_name: string;
	email: string;
};

// Backend ticket response type (from Rails API)
export type BackendTicket = {
	id: number;
	public_id: string;
	event_id: number;
	ticket_type_id: number;
	attendee_name: string;
	attendee_email: string;
	attendee_phone: string | null;
	checked_in: boolean;
	check_in_at: string | null;
	scanned_by_id: number | null;
	scanned_by?: BackendUser | null; // User who scanned the ticket
	status: "purchased" | "scanned" | "refunded" | "canceled";
	created_at: string;
	updated_at: string;
	ticket_type?: {
		id: number;
		name: string;
		price: string;
	};
};

// Frontend scanned log type
export type ScannedLog = {
	id: string;
	name: string;
	email: string;
	phone: string;
	locationName: string;
	scannedBy: string;
	status: "scanned" | "not_scanned";
	checkedInAt: string;
};
