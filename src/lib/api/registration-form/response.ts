export interface BackendRegistrationFormTicketType {
	id: number;
	name: string;
	price: number;
	status: "draft" | "published" | "archived";
	registration_mode?: "single" | "group";
	min_attendees?: number;
	max_attendees?: number | null;
	custom_labels_data?: Record<string, string>;
}

export interface BackendRegistrationForm {
	id: number;
	event_id: number;
	name: string;
	slug: string;
	description: string | null;
	custom_labels_data: Record<string, string>;
	status: number;
	position: number | null;
	created_at: string;
	updated_at: string;
	ticket_types: BackendRegistrationFormTicketType[];
}

export interface RegistrationFormTicketType {
	id: number;
	name: string;
	price: number;
	status: "draft" | "published" | "archived";
	registrationMode: "single" | "group";
	minAttendees: number;
	maxAttendees: number | null;
	customLabelsData: Record<string, string>;
}

export interface RegistrationForm {
	id: number;
	eventId: number;
	name: string;
	slug: string;
	description: string | null;
	customLabelsData: Record<string, string>;
	status: number;
	position: number | null;
	createdAt: string;
	updatedAt: string;
	ticketTypes: RegistrationFormTicketType[];
}

export type CreateRegistrationFormResponse = RegistrationForm;
export type UpdateRegistrationFormResponse = RegistrationForm;
export type DeleteRegistrationFormResponse = {
	success: boolean;
};
