/**
 * Scan Result Types
 * Type definitions for the ticket scanning feature
 */

export interface ScanResult {
	ticketId: string; // This is the public_id from QR code
	timestamp: Date;
	status: "success" | "error" | "duplicate";
	message: string;
	attendeeName?: string;
	attendeeEmail?: string;
	attendeePhone?: string;
	ticketType?: string;
	ticketValue?: number;
	seatNumber?: string;
	checkedIn?: boolean;
	checkInAt?: string | null;
	eventName?: string; // Name of the event
	eventId?: number; // ID of the event
}

export type ScanStatus = ScanResult["status"];
export type FilterType = string; // Event ID or "all"
export type SortType = "newest" | "oldest" | "status";
