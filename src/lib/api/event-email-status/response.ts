export type EmailStatusGroup = "delivered" | "sent" | "pending" | "problem";

export type EmailStatus =
	| "queued"
	| "sending"
	| "sent"
	| "delivered"
	| "failed"
	| "bounced"
	| "complained"
	| "suppressed";

export interface EventEmailDelivery {
	id: number;
	emailType: string;
	recipient: string | null;
	subject: string | null;
	status: EmailStatus;
	problem: string | null;
	createdAt: string;
	sentAt: string | null;
	deliveredAt: string | null;
	problemAt: string | null;
	attendee: { ticketId: number; name: string } | null;
	canResend: boolean;
}

export interface EventEmailDeliveryPage {
	items: EventEmailDelivery[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalCount: number;
		perPage: number;
	};
}

export type EventEmailSummary = Record<EmailStatusGroup, number>;

export interface EventEmailStatusSummary {
	groups: EventEmailSummary;
	emailTypes: string[];
}

export interface BackendEventEmailDelivery {
	id: number;
	email_type: string;
	recipient: string | null;
	subject: string | null;
	status: EmailStatus;
	problem: string | null;
	created_at: string;
	sent_at: string | null;
	delivered_at: string | null;
	problem_at: string | null;
	attendee: { ticket_id: number; name: string } | null;
	can_resend: boolean;
}

export interface BackendEventEmailListResponse {
	data: BackendEventEmailDelivery[];
	pagination: {
		current_page: number;
		total_pages: number;
		total_count: number;
		per_page: number;
	};
}

export interface BackendEventEmailShowResponse {
	data: BackendEventEmailDelivery;
}

export interface BackendEventEmailSummaryResponse {
	data: EventEmailSummary;
	email_types: string[];
}
