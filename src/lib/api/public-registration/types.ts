export type PublicRegistrationMode = "conference" | "visitor" | "golf";

export interface PublicRegistrationFormItem {
	slug: string;
	name: string;
	description: string | null;
	custom_labels_data: Array<{ key: string; label: string }>;
}

export interface PublicRegistrationFormsResponse {
	success: boolean;
	data: PublicRegistrationFormItem[];
}

export interface PublicTicketTypeItem {
	id: number;
	name: string;
	price: number;
	current_tier: string | null;
	available: boolean;
	remaining_slots?: number | null;
	registration_mode: "single" | "group";
	min_attendees: number;
	max_attendees?: number | null;
	allow_multiple_tickets_per_email: boolean;
	custom_fields_data?: Record<string, string | number | boolean | null>;
	custom_labels_data?: Array<{ key: string; label: string }>;
}

export interface PublicTicketTypesResponse {
	success: boolean;
	data: PublicTicketTypeItem[];
}

export interface ExistingRegistrationTicketItem {
	id: number;
	public_id: string;
	attendee_name: string;
	payment_status: "pending" | "paid" | "failed" | "refunded_payment";
	status: string;
	created_at: string;
}

export interface ExistingRegistrationStatusData {
	has_pending_payment: boolean;
	has_paid_ticket: boolean;
	has_rejected_application?: boolean;
	rejected_message?: string | null;
	upgrade_mode?: boolean;
	upgrade_target?: string | null;
	existing_ticket_public_id?: string | null;
	existing_attendee_name?: string | null;
	existing_attendee_email?: string | null;
	existing_attendee_phone?: string | null;
	existing_ticket_type?: string | null;
	blocked_exhibitor_upgrade?: boolean;
	blocked_reason?: string | null;
	blocked_message?: string | null;
	pending_tickets: ExistingRegistrationTicketItem[];
	paid_tickets: ExistingRegistrationTicketItem[];
}

export interface ExistingRegistrationStatusResponse {
	success: boolean;
	data: ExistingRegistrationStatusData;
}

export interface CreatePaymentOrderPayload {
	ticket_public_id: string;
}

export interface CreatePaymentOrderData {
	already_paid?: boolean;
	ticket_public_id: string;
	payment_status?: "pending" | "paid" | "failed" | "refunded_payment";
	status?: string;
	key_id?: string;
	order_id?: string;
	amount?: number;
	currency?: string;
	callback_url?: string;
}

export interface CreatePaymentOrderResponse {
	success: boolean;
	data: CreatePaymentOrderData;
}

export interface VerifyPaymentPayload {
	ticket_public_id: string;
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
}

export interface VerifyPaymentData {
	ticket_public_id: string;
	payment_status: "pending" | "paid" | "failed" | "refunded_payment";
	status: string;
	already_paid?: boolean;
}

export interface VerifyPaymentResponse {
	success: boolean;
	data: VerifyPaymentData;
}

export interface CreatePublicRegistrationPayload {
	attendee_name: string;
	attendee_email?: string;
	attendee_phone?: string;
	ticket_type_id: number;
	role?: string;
	form_slug?: string;
	registered_by_email?: string;
	custom_fields_data?: Record<string, string>;
	bundle?: string;
}

export interface CreatedPublicRegistration {
	ticket_id: number;
	public_id: string;
	attendee_name: string;
	attendee_email: string | null;
	attendee_phone: string | null;
	role: string | null;
	ticket_type: string;
	price: number;
	payment_status: "pending" | "paid" | "failed" | "refunded_payment";
	custom_fields_data: Record<string, string>;
	qr_code_data: string;
}

export interface CreatePublicRegistrationResponse {
	success: boolean;
	data: CreatedPublicRegistration;
}

export interface PublicTicketDetails {
	public_id: string;
	attendee_name: string;
	attendee_email: string | null;
	attendee_phone: string | null;
	role: string | null;
	ticket_type: string;
	price: number;
	event: {
		title: string;
		start_date: string | null;
		end_date: string | null;
		venue_name: string | null;
		logo_url: string | null;
	};
	custom_fields_data: Record<string, string>;
	qr_code_base64: string;
}

export interface PublicTicketDetailsResponse {
	success: boolean;
	data: PublicTicketDetails;
}

export interface PublicPassBundle {
	name: string;
	token: string;
	pass_limit: number;
	used_count: number;
	remaining_count: number;
	payment_mode: string;
	payment_status: string;
	registration_form: {
		name: string;
		slug: string;
	};
	ticket_type: {
		id: number;
		name: string;
	};
}

export interface PublicPassBundleResponse {
	success: boolean;
	data: PublicPassBundle;
}
