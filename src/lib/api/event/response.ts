// Pure TypeScript types for API responses

export type EventEmailSetting = {
	sender_name: string | null;
	sender_address: string | null;
	contact_email: string | null;
	payment_receipt_email: string | null;
};

export type Event = {
	id: number;
	title: string;
	slug: string;
	description: string | null;
	status: "draft" | "published" | "cancelled" | "completed";
	visibility: boolean;
	multiple_scans: boolean;
	use_ticket: boolean;
	use_wedding: boolean;
	use_seat_ticketing: boolean;
	use_exhibitor_kit: boolean;
	allow_contractor_printing_services: boolean;
	use_business_matching: boolean;
	use_sponsorship: boolean;
	payment_receipt_email: string | null;
	event_email_setting: EventEmailSetting | null;
	start_date: string;
	end_date: string;
	webhook_url: string | null;
	business_matching_webhook_url: string | null;
	labels_data: Record<string, string>;
	booth_types: string[];
	payment_status: "unpaid" | "paid" | "waived";
	price: string;
	published: boolean;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
	logo_url: string | null;
};

export type EventDetails = Event;

// Backend response types (raw API responses) - BackendEvent is the same as Event
export type BackendEvent = Event;
