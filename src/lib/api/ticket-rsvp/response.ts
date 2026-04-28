export type PublicTicketRsvpData = {
	attendee_name: string;
	attendee_email: string | null;
	attendee_phone: string | null;
	event_title: string;
	review_status: "pending_review" | "approved" | "rejected";
	rsvp_status: "not_sent" | "sent" | "confirmed" | "declined" | "expired";
	rsvp_expires_at: string | null;
	ticket_status: string;
	payment_status: string;
};

export type PublicTicketRsvpResponse = {
	success: boolean;
	message?: string;
	data: PublicTicketRsvpData;
};
