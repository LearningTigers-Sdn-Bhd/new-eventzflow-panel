// Types for unified scan API responses

// The type of scanned entity
export type ScanType = "ticket" | "visitor";

// Backend response from PATCH /v1/scan/:public_id/check_in
export interface BackendScanCheckInResponse {
	type: ScanType;
	public_id: string;
	id: number;
	checked_in: boolean;
	check_in_at: string;
	event: {
		id: number;
		title: string;
	};
	scanned_by?: {
		id: number;
		full_name: string;
	} | null;
	role?: string | null;
	// Ticket-specific fields
	attendee_name?: string;
	attendee_email?: string;
	attendee_phone?: string;
	ticket_type?: {
		id: number;
		name: string;
		price: number;
	};
	// Visitor-specific fields
	full_name?: string;
	email?: string;
	phone?: string;
	gender?: string;
	age?: number;
}

// Frontend-friendly response format
export interface ScanCheckInResponse {
	type: ScanType;
	publicId: string;
	id: string;
	role?: string | null;
	checkedIn: boolean;
	checkInAt: string;
	// Common fields (normalized)
	name: string;
	email?: string;
	phone?: string;
	// Event info
	eventId: number;
	eventName: string;
	// Scanned by info
	scannedBy?: {
		id: number;
		fullName: string;
	};
	// Ticket-specific (only present when type === "ticket")
	ticketType?: {
		id: number;
		name: string;
		price: number;
	};
	// Visitor-specific (only present when type === "visitor")
	gender?: string;
	age?: number;
}

// Backend response from GET /v1/scan/recent_check_ins
export interface BackendRecentCheckIn {
	type: ScanType;
	scan_id: string;
	role?: string | null;
	name: string;
	email?: string;
	phone?: string;
	ticket_type?: string;
	ticket_value?: number;
	gender?: string;
	age?: number;
	event_id: number;
	event_name: string;
	checked_in: boolean;
	check_in_at: string;
	status: "success";
	scanned_by?: {
		id: number;
		full_name: string;
	} | null;
}

export interface BackendRecentCheckInsResponse {
	check_ins: BackendRecentCheckIn[];
	total: number;
	limit: number;
}

// Custom error class for check-in errors that includes the scan type
export class ScanCheckInError extends Error {
	type: ScanType | null;

	constructor(message: string, type: ScanType | null = null) {
		super(message);
		this.name = "ScanCheckInError";
		this.type = type;
	}
}

// Frontend-friendly format for recent check-ins
export interface RecentCheckIn {
	type: ScanType;
	scanId: string;
	role?: string | null;
	name: string;
	email?: string;
	phone?: string;
	ticketType?: string;
	ticketValue?: number;
	gender?: string;
	age?: number;
	eventId: number;
	eventName: string;
	checkedIn: boolean;
	checkInAt: string;
	timestamp: Date;
	status: "success";
	scannedBy?: {
		id: number;
		fullName: string;
	};
}
