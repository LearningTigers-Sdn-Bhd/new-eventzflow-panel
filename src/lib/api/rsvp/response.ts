export interface RsvpCompanion {
	id: number;
	full_name: string;
	phone?: string;
	email?: string;
}

export interface RsvpVisitor {
	full_name: string;
	public_id: string;
	rsvp_status: "pending" | "attending" | "declined";
	rsvp_responded_at?: string;
	companions: RsvpCompanion[];
}

export interface RsvpEvent {
	title: string;
	start_date: string;
	end_date: string;
	extra_guest_limit: number | null;
}

export interface RsvpPageData {
	visitor: RsvpVisitor;
	event: RsvpEvent;
}

export interface RsvpRespondResult {
	visitor: RsvpVisitor;
}
