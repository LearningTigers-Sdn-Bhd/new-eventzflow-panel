// Backend user type (from Rails API) - specific to scan logs
export type ScanLogBackendUser = {
	id: number;
	full_name: string;
	email: string;
};

// Backend check-in record type
export type ScanLogBackendCheckIn = {
	id: number;
	check_in_at: string;
	scanned_by?: ScanLogBackendUser | null;
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
	checked_in_today?: boolean;
	status: "purchased" | "scanned" | "refunded" | "canceled";
	created_at: string;
	updated_at: string;
	ticket_type?: {
		id: number;
		name: string;
		price: string;
	};
	check_ins?: ScanLogBackendCheckIn[];
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
