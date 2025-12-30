// Pure TypeScript types for API responses

export interface EventExhibitionContractorProfile {
	id: number;
	user_id: number;
	contact_person: string | null;
	contact_email: string | null;
	contact_phone: string | null;
	guidelines_pdf_url: string | null;
	guidelines_pdf_filename: string | null;
	created_at: string;
	updated_at: string;
}

export interface EventExhibitionContractorUser {
	id: number;
	full_name: string;
	email: string;
	phone: string | null;
}

export interface EventExhibitionContractor {
	id: number;
	event_id: number;
	exhibition_contractor_profile_id: number;
	created_at: string;
	updated_at: string;
	exhibition_contractor_profile?: EventExhibitionContractorProfile;
	contractor?: EventExhibitionContractorUser;
}
