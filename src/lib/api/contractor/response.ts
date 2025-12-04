// Pure TypeScript types for API responses

export interface ExhibitionContractorProfile {
	id: number;
	user_id: number;
	company_name: string;
	contact_person: string;
	contact_email: string;
	contact_phone: string;
	created_at: string;
	updated_at: string;
}

export type ContractorStatus = "active" | "inactive";

export interface ExhibitionContractor {
	id: number;
	email: string;
	full_name: string;
	phone: string;
	role: "exhibition_contractor";
	status: ContractorStatus;
	created_at: string;
	updated_at: string;
	exhibition_contractor_profile: ExhibitionContractorProfile | null;
}
