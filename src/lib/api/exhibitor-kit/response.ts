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
export type PaymentStatus =
	| "unpaid"
	| "paid"
	| "waived"
	| "sponsored"
	| "deposit";

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
	payment_proof_status?: "pending" | "submitted" | "rejected" | "paid" | string;
	payment_note?: string | null;
	external_ref: string | null;
	note: string | null;
	paid_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface ExhibitorKit {
	id: number;
	public_id?: string;
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
	booking_status?: "active" | "paid" | "cancelled" | "expired";
	payment_proof_url?: string | null;
	payment_proof_status?: "pending" | "submitted" | "rejected" | "paid" | string;
	amount_paid?: string;
	payment_note?: string;
	indemnity_link?: string;
	exhibitor_booth_price_id?: number;
	exhibitor_booth_id?: number | null;
	exhibitor_booth_price_label?: string | null;
	exhibitor_booth_price_zone?: string | null;
	exhibitor_package_id?: number | null;
	exhibitor_package_name?: string | null;
	exhibitor_package_inclusions?: string | null;
	exhibitor_voucher_code?: string | null;
	exhibitor_voucher_discount_type?:
		| "percentage_off"
		| "fixed_amount_off"
		| "flat_price"
		| null;
	exhibitor_voucher_discount_value?: string | number | null;
	custom_fields_data?: Record<string, unknown>;
	ic_copy_uploaded?: boolean;
	customs_declaration_uploaded?: boolean;
	customs_duty_estimate_uploaded?: boolean;
	indemnity_form_uploaded?: boolean;
	booking_batch_id?: string | null;
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

export interface ImportExhibitorKitsRowResult {
	row: number;
	id?: number;
	public_id?: string;
	vendor_email?: string;
	vendor_name?: string;
	company_name?: string;
	pic_name?: string;
	booth_type?: string;
	zone?: string;
	price_label?: string;
	/** The Booth No cell for this row. Only meaningfully validated when the
	 * resolved Booth Type has real numbered-booth inventory set up — otherwise
	 * it's just a free-text label passed through as-is. */
	booth_no?: string | null;
	package_name?: string;
	booth_quantity?: number;
	payment_status?: string;
	amount?: number;
	error?: string;
	/** True for rows in `skipped` that matched an already-imported booking (same
	 * vendor/booth/package/quantity) — re-uploading the same file lands here
	 * instead of creating a second booking. Not present on plain error rows. */
	duplicate?: boolean;
	existing_kit_id?: number;
	existing_kit_public_id?: string;
	existing_created_at?: string;
	/** True on an `errors` row whose Booth No belongs to a real inventory booth
	 * that's already claimed by another active/paid booking — as opposed to a
	 * not-found or wrong-booth-type Booth No error. Lets the preview badge this
	 * case distinctly from a generic row error. */
	booth_taken?: boolean;
}

export interface ImportExhibitorKitsResponse {
	total: number;
	created: { count: number; data: ImportExhibitorKitsRowResult[] };
	skipped: { count: number; data: ImportExhibitorKitsRowResult[] };
	errors: { count: number; data: ImportExhibitorKitsRowResult[] };
}
