// Pure TypeScript types for API responses

export interface ExhibitorTeamMember {
	id?: number;
	exhibitor_kit_id?: number;
	full_name: string;
	_destroy?: boolean;
}

export type BoothType = "shell_scheme" | "raw_space";
export type PaymentStatus = "unpaid" | "paid" | "waived" | "sponsored";

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
	extra_crew_count: number;
	special_requirements?: string;
	digital_brochure_link?: string;
	qr_code_url?: string;
	contractor_company_name?: string;
	contractor_pic_name?: string;
	contractor_pic_contact?: string;
	stand_design_file_url?: string;
	furniture_requests?: Record<string, unknown>;
	electrical_requests?: Record<string, unknown>;
	printing_orders?: Record<string, unknown>;
	indemnity_signed: boolean;
	indemnity_document_url?: string;
	payment_status: PaymentStatus;
	amount_paid?: string;
	payment_note?: string;
	indemnity_link?: string;
	exhibitor_team_members: ExhibitorTeamMember[];
	created_at?: string;
	updated_at?: string;
}
