/**
 * Event Check-In API Types
 */

export type CheckInMethod = "name" | "email" | "phone" | "scan";

export interface PublicEventInfo {
	id: number;
	title: string;
	slug: string;
	use_ticket: boolean;
	poster_url?: string | null;
}

export interface AttendeePreview {
	public_id: string;
	name: string;
	email: string | null;
	phone: string | null;
	role: string | null;
	type_name: string | null;
	checked_in: boolean;
	check_in_at: string | null;
}

export interface SearchResponse {
	action: "select";
	message: string;
	attendees: AttendeePreview[];
}

export interface CheckInSuccessResponse {
	action: "checked_in";
	message: string;
	// True when this attendee was already checked in before this scan (a
	// multi-scan-allowed rescan), so the UI can still offer Reprint even
	// though the scan went through the success path, not the blocked one.
	rescanned?: boolean;
	attendee: AttendeePreview;
}

export type CheckInResponse = SearchResponse | CheckInSuccessResponse;
