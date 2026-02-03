/**
 * Event Check-In API Types
 */

export type CheckInMethod = "name" | "email" | "phone" | "scan";

export interface PublicEventInfo {
	id: number;
	title: string;
	slug: string;
	use_ticket: boolean;
}

export interface AttendeePreview {
	public_id: string;
	name: string;
	email: string | null;
	phone: string | null;
	role: string | null;
	type_name: string | null;
	checked_in: boolean;
	checked_in_today?: boolean;
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
	attendee: AttendeePreview;
}

export type CheckInResponse = SearchResponse | CheckInSuccessResponse;
