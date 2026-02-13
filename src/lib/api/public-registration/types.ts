export type PublicRegistrationMode = "conference" | "visitor" | "golf";

export interface PublicRegistrationFormItem {
  slug: string;
  name: string;
  description: string | null;
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
  registration_mode: "single" | "group";
  min_attendees: number;
  max_attendees?: number | null;
  custom_fields_data?: Record<string, string | number | boolean | null>;
}

export interface PublicTicketTypesResponse {
  success: boolean;
  data: PublicTicketTypeItem[];
}

export interface CreatePublicRegistrationPayload {
  attendee_name: string;
  attendee_email?: string;
  attendee_phone?: string;
  ticket_type_id: number;
  role?: string;
  form_slug?: string;
  custom_fields_data?: Record<string, string>;
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
