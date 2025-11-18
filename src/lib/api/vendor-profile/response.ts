// Pure TypeScript types for API responses

export interface VendorUser {
	id: number;
	full_name: string;
	email: string;
	phone: string | null;
}

export interface VendorProfile {
	id: number;
	vendor_id: number;
	image_path: string | null;
	description: string | null;
	category: string | null;
	person_in_charge: string | null;
	address: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
	vendor: VendorUser;
}
