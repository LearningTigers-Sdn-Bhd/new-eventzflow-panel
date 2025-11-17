// Pure TypeScript types for API responses

export type Event = {
	id: number;
	title: string;
	description: string | null;
	status: "draft" | "published" | "cancelled";
	visibility: boolean;
	multiple_scans: boolean;
	use_ticket: boolean;
	start_date: string;
	end_date: string;
	webhook_url: string | null;
	labels_data: Record<string, any>;
	payment_status: "unpaid" | "paid" | "waived";
	price: string;
	published: boolean;
	created_at: string;
	updated_at: string;
};

export type EventDetails = Event;

// Backend response types (raw API responses) - BackendEvent is the same as Event
export type BackendEvent = Event;
