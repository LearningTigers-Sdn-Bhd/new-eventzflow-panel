// Pure TypeScript types for API responses

export interface ExhibitorTeamMember {
	id?: number;
	exhibitor_kit_id?: number;
	full_name: string;
	created_at?: string;
	updated_at?: string;
	_destroy?: boolean;
}

export interface RentableItemInfo {
	id: number;
	name: string;
	unit_of_measure: string;
	default_price: number;
}

export interface PrintingServiceInfo {
	id: number;
	name: string;
	unit_of_measure: string;
	default_price: number;
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

export type BoothType = "shell_scheme" | "raw_space";
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
	exhibitor_team_members: ExhibitorTeamMember[];
	exhibitor_kit_items?: ExhibitorKitItem[];
	exhibitor_kit_printings?: ExhibitorKitPrinting[];
	custom_requests?: CustomRequest[];
	team_member_count?: number;
	team_member_limit?: number | null;
	excess_team_member_count?: number;
	exceeds_team_member_limit?: boolean;
	extra_team_member_fee?: string;
	extra_team_member_charges?: string;
	created_at?: string;
	updated_at?: string;
}
