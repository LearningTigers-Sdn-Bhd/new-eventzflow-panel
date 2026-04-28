// Backend ticket response type (with payment fields)
export interface BackendPendingTicket {
	id: number;
	public_id: string;
	attendee_name: string;
	attendee_email: string;
	attendee_phone?: string | null;
	role?: string | null;
	ticket_type_id: number;
	event_id: number;
	status: "purchased" | "scanned" | "refunded" | "canceled" | "pending_payment";
	payment_status: "pending" | "paid" | "failed" | "refunded_payment" | number; // Can be string or number
	payment_screenshot_url?: string | null;
	transaction_id?: string | null;
	payment_method?: string | null;
	checked_in: boolean;
	check_in_at: string | null;
	custom_fields_data: Record<string, string> | null;
	created_at: string;
	updated_at: string;
	ticket_type?: {
		id: number;
		name: string;
		price: number;
	};
	ticket_application?: BackendTicketApplication | null;
}

export type ReviewStatus = "pending_review" | "approved" | "rejected";
export type RsvpStatus =
	| "not_sent"
	| "sent"
	| "confirmed"
	| "declined"
	| "expired";

export interface BackendTicketApplication {
	review_status: ReviewStatus;
	rsvp_status: RsvpStatus;
	reviewed_at: string | null;
	rejection_reason: string | null;
	rsvp_sent_at: string | null;
	rsvp_confirmed_at: string | null;
	rsvp_expires_at: string | null;
}

// Frontend pending ticket type
export type PendingTicket = {
	id: string;
	publicId: string;
	name: string;
	email: string;
	phone: string;
	role?: string | null;
	value: number;
	status: "scanned" | "not_scanned";
	customLabels: Array<{ name: string; value: string }>;
	createdAt: string;
	paymentStatus: "pending" | "paid" | "failed" | "refunded_payment";
	paymentScreenshotUrl?: string;
	transactionId?: string;
	paymentMethod?: string;
	ticketTypeName?: string;
	ticketTypeId?: number;
	ticketApplication?: {
		reviewStatus: ReviewStatus;
		rsvpStatus: RsvpStatus;
		reviewedAt: string | null;
		rejectionReason: string | null;
		rsvpSentAt: string | null;
		rsvpConfirmedAt: string | null;
		rsvpExpiresAt: string | null;
	};
};

// Response types for operations
export type CreatePendingTicketResponse = PendingTicket;
export type UpdatePendingTicketResponse = PendingTicket;
