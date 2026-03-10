// Pure TypeScript types for API responses

export interface Visitor {
	id: number;
	event_id: number;
	public_id: string;
	role?: string;
	full_name: string;
	email: string;
	phone: string;
	gender?: string;
	age?: number;
	checked_in: boolean;
	check_in_at?: string;
	scanned_by_id?: number;
	custom_fields_data?: Record<string, string>;
	rsvp_status?: "pending" | "attending" | "declined";
	rsvp_responded_at?: string;
	added_by_id?: number;
	added_by_name?: string;
	companion_count?: number;
	created_at: string;
	updated_at: string;
}
