// Pure TypeScript types for API responses
import type {
	BackendTicketApplication,
	ReviewStatus,
	RsvpStatus,
} from "@/lib/api/event/pending/response";

// Frontend types (transformed from backend)
export type Ticket = {
	id: string;
	publicId: string;
	role?: string;
	name: string;
	email: string;
	registeredByEmail?: string;
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
	deletedAt?: string | null;
	paymentMethod?: string;
	transactionId?: string;
	paymentScreenshotUrl?: string;
	passBundle?: {
		id: number;
		name: string;
	} | null;
	customLabels?: Array<{
		name: string;
		value: string;
	}>;
	custom_fields_data?: Record<string, string> | null;
	documents?: Array<{
		key: string | null;
		filename: string;
		url: string;
	}>;
	vehicleRegistration?: {
		plate: string;
		registrationFormId: number;
		registrationFormName: string | null;
		registrationFormSlug: string | null;
	} | null;
	ticketApplication?: {
		reviewStatus: ReviewStatus;
		rsvpStatus: RsvpStatus;
	};
};

export type ScannedTicket = {
	id: string;
	role?: string;
	name: string;
	email: string;
	registeredByEmail?: string;
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
	custom_fields_data?: Record<string, string> | null;
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

// Import tickets response
export type ImportTicketsResponse = {
	created: number;
	updated?: number;
	skipped: number;
	duplicates_in_file?: number;
	errors: string[];
};

// Backend import response (raw API response)
export type BackendImportTicketsResponse = {
	success: boolean;
	message: string;
	data: {
		created: number;
		updated?: number;
		skipped: number;
		duplicates_in_file?: number;
		errors: string[];
	};
};

// Backend response types (raw API responses from v1/events/{id}/tickets)
export type BackendTicket = {
	id: number;
	public_id: string;
	role?: string | null;
	attendee_name: string;
	attendee_email: string;
	registered_by_email?: string | null;
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
	deleted_at: string | null;
	payment_method?: string;
	transaction_id?: string;
	payment_screenshot_url?: string;
	pass_bundle?: {
		id: number;
		name: string;
	} | null;
	ticket_type?: {
		id: number;
		name: string;
		price: number;
	};
	registration_documents_data?: Array<{
		key: string | null;
		filename: string;
		url: string;
	}>;
	vehicle_registration_data?: {
		plate: string;
		registration_form_id: number;
		registration_form_name: string | null;
		registration_form_slug: string | null;
	} | null;
	ticket_application?: BackendTicketApplication | null;
};

// Backend response types (transformed from other endpoints like scanned tickets)
export type BackendTicketTransformed = {
	id: number;
	public_id: string;
	role?: string | null;
	attendee_name: string;
	attendee_email: string;
	registered_by_email?: string | null;
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
	role?: string | null;
	attendee_name: string;
	attendee_email: string;
	attendee_phone?: string;
	ticket_type_name?: string;
	value?: number;
	checked_in: boolean;
	check_in_at: string;
	event_name?: string;
	event_id: number;
	// Nested objects from includes
	ticket_type?: {
		id: number;
		name: string;
		price: number;
	};
	event?: {
		id: number;
		title: string;
	};
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
