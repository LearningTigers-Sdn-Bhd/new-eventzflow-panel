export interface CustomLabelEntry {
	key: string;
	label: string;
}

export interface BackendRegistrationFormTicketType {
	id: number;
	name: string;
	price: number;
	status: "draft" | "published" | "archived";
	registration_mode?: "single" | "group";
	min_attendees?: number;
	max_attendees?: number | null;
	custom_labels_data?: CustomLabelEntry[];
}

export interface BackendRegistrationForm {
	id: number;
	event_id: number;
	name: string;
	slug: string;
	description: string | null;
	custom_labels_data: CustomLabelEntry[];
	status: number;
	position: number | null;
	registration_form_rsvp_setting?: {
		id: number;
		registration_form_id: number;
		enabled: boolean;
		rsvp_required: boolean;
		rsvp_expires_in_hours: number | null;
		review_sla_hours: number;
		notify_by_date: string | null;
		created_at: string;
		updated_at: string;
	} | null;
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
	customLabelsData: CustomLabelEntry[];
}

export interface RegistrationForm {
	id: number;
	eventId: number;
	name: string;
	slug: string;
	description: string | null;
	customLabelsData: CustomLabelEntry[];
	status: number;
	position: number | null;
	rsvpSetting: {
		id: number;
		registrationFormId: number;
		enabled: boolean;
		rsvpRequired: boolean;
		rsvpExpiresInHours: number | null;
		reviewSlaHours: number;
		notifyByDate: string | null;
		createdAt: string;
		updatedAt: string;
	} | null;
	createdAt: string;
	updatedAt: string;
	ticketTypes: RegistrationFormTicketType[];
}

export type CreateRegistrationFormResponse = RegistrationForm;
export type UpdateRegistrationFormResponse = RegistrationForm;
export type DeleteRegistrationFormResponse = {
	success: boolean;
};
