// Pure TypeScript types for API responses

// Frontend types (transformed from backend)
export type Ticket = {
	id: string;
	publicId: string;
	name: string;
	email: string;
	phone?: string;
	ticketTypeName: string;
	ticketTypeId: number;
	value: number;
	checkedIn: boolean;
	checkInAt?: string;
	eventName: string;
	eventId: string;
	status: "scanned" | "not_scanned";
	createdAt: string;
	customLabels?: Array<{
		name: string;
		value: string;
	}>;
};

export type ScannedTicket = {
	id: string;
	name: string;
	email: string;
	phone?: string;
	ticketTypeName: string;
	ticketTypeId: number;
	value: number;
	checkedIn: boolean;
	checkInAt?: string;
	eventName: string;
	eventId: string;
	createdAt?: string;
	customLabels?: Array<{
		name: string;
		value: string;
	}>;
};

export type CheckInResponse = {
	id: string;
	publicId: string;
	name: string;
	email: string;
	phone?: string;
	ticketTypeName: string;
	value: number;
	checkedIn: boolean;
	checkInAt: string;
	eventName: string;
	eventId: string;
};

export type CreateTicketResponse = Ticket;
export type UpdateTicketResponse = Ticket;

// Backend response types (raw API responses from v1/events/{id}/tickets)
export type BackendTicket = {
	id: number;
	public_id: string;
	attendee_name: string;
	attendee_email: string;
	attendee_phone?: string | null;
	ticket_type_id: number;
	event_id: number;
	status: "purchased" | "scanned" | "refunded" | "canceled";
	payment_status: "pending" | "paid" | "failed" | "refunded_payment" | number;
	checked_in: boolean;
	check_in_at: string | null;
	scanned_by_id?: number | null;
	custom_fields_data: Record<string, string> | null;
	created_at: string;
	updated_at: string;
	ticket_type?: {
		id: number;
		name: string;
		price: number;
	};
};

// Backend response types (transformed from other endpoints like scanned tickets)
export type BackendTicketTransformed = {
	id: number;
	public_id: string;
	attendee_name: string;
	attendee_email: string;
	attendee_phone?: string;
	ticket_type_name: string;
	ticket_type_id: number;
	value: number;
	checked_in: boolean;
	check_in_at?: string;
	created_at?: string;
	event_name: string;
	event_id: number;
	custom_labels?: Array<{
		name: string;
		value: string;
	}>;
};

export type BackendCheckInResponse = {
	id: number;
	public_id: string;
	attendee_name: string;
	attendee_email: string;
	attendee_phone?: string;
	ticket_type_name: string;
	value: number;
	checked_in: boolean;
	check_in_at: string;
	event_name: string;
	event_id: number;
};

// Scan-storage types (merged from scan-storage API)
export interface OfflineEvent {
	id: number;
	title: string;
}

export interface OfflineTicket {
	publicId: string;
	eventId: number;
	eventName: string;
	name: string;
	email: string;
	phone: string;
	ticketTypeName?: string;
	value: number;
	checkedIn?: boolean;
	checkInAt?: string | null;
}

export interface OfflineData {
	events: OfflineEvent[];
	tickets: OfflineTicket[];
}

// Backend response type (what the API actually returns)
export interface BackendOfflineData {
	events: Array<{ id: number; title: string }>;
	tickets: Array<{
		id: string;
		name: string;
		email: string;
		phone: string;
		value: number;
		status: "scanned" | "not_scanned";
		customLabels: Array<{ name: string; value: string }>;
		createdAt: string;
		ticketTypeId: number;
		ticketTypeName: string;
		checkedIn: boolean;
		checkInAt: string | null;
		eventId?: number;
		eventName?: string;
	}>;
}
