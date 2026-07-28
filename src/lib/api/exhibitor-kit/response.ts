// Pure TypeScript types for API responses

export interface ExhibitorTeamMember {
	id?: number;
	exhibitor_kit_id?: number;
	full_name: string;
	email: string;
	phone: string;
	attendee_type?: string;
	attendee_id?: number;
	created_at?: string;
	updated_at?: string;
	_destroy?: boolean;
}

export interface RentableItemInfo {
	id: number;
	name: string;
	unit_of_measure: string;
	default_price: number;
	image_url?: string | null;
}

export interface PrintingServiceInfo {
	id: number;
	name: string;
	unit_of_measure: string;
	default_price: number;
	image_url?: string | null;
}

export interface ExhibitorKitItem {
	id: number;
	exhibitor_kit_id: number;
	rentable_item_id: number;
	quantity: number;
	agreed_price: number;
	notes?: string;
	rentable_item?: RentableItemInfo;
}

export interface ExhibitorKitPrinting {
	id: number;
	exhibitor_kit_id: number;
	printing_service_id: number;
	quantity: number;
	agreed_price: number;
	file_reference?: string;
	notes?: string;
	printing_service?: PrintingServiceInfo;
}

export type BoothType = string;
export type PaymentStatus = "unpaid" | "paid" | "waived" | "sponsored";

export interface CustomRequest {
	id: number;
	exhibitor_kit_id: number;
	description: string;
	quantity: number;
	status: "pending" | "approved" | "rejected";
	resolved_price?: number;
	response_notes?: string;
	created_at?: string;
	updated_at?: string;
}

export type TeamMemberPaymentStatus =
	| "pending"
	| "submitted"
	| "verified"
	| "rejected";

export interface ExhibitorTeamMemberPaymentInKit {
	id: number;
	exhibitor_kit_id: number;
	payee_id: number | null;
	extra_member_count: number;
	fee_per_member: string;
	amount: string;
	status: TeamMemberPaymentStatus;
	payment_source: "manual_bank_in" | "payment_gateway" | null;
	payment_proof_url: string | null;
	external_ref: string | null;
	note: string | null;
	paid_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface ExhibitorKit {
	id: number;
	event_vendor_id: number;
	booth_number: string;
	booth_type: BoothType;
	booth_dimensions?: string;
	side_wall_left_required: boolean;
	side_wall_right_required: boolean;
	name_on_fascia: string;
	fascia_upgrade_required: boolean;
	company_name: string;
	company_address: string;
	country?: string;
	pic_full_name: string;
	pic_contact_number: string;
	pic_email_address: string;
	special_requirements?: string;
	digital_brochure_link?: string;
	qr_code_url?: string;
	indemnity_signed: boolean;
	indemnity_document_url?: string;
	payment_status: PaymentStatus;
	amount_paid?: string;
	payment_note?: string;
	indemnity_link?: string;
	exhibitor_booth_price_id?: number;
	exhibitor_booth_price_label?: string | null;
	exhibitor_booth_price_zone?: string | null;
	custom_fields_data?: Record<string, unknown>;
	ic_copy_uploaded?: boolean;
	exhibitor_team_members: ExhibitorTeamMember[];
	exhibitor_kit_items?: ExhibitorKitItem[];
	exhibitor_kit_printings?: ExhibitorKitPrinting[];
	custom_requests?: CustomRequest[];
	exhibitor_team_member_payments?: ExhibitorTeamMemberPaymentInKit[];
	team_member_count?: number;
	team_member_limit?: number | null;
	excess_team_member_count?: number;
	paid_extra_member_count?: number;
	used_paid_extra_member_count?: number;
	unpaid_excess_team_member_count?: number;
	has_unpaid_excess_team_members?: boolean;
	extra_team_member_fee?: string;
	extra_team_member_charges?: string;
	extra_team_member_payment_mode?: "manual_bank_in" | "payment_gateway";
	created_at?: string;
	updated_at?: string;
}
