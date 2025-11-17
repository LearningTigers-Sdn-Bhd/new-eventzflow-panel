// Pure TypeScript types for API responses

export interface VendorProfile {
	id: number;
	group_id: number;
	vendor_id: number;
	image_path: string | null;
	vendor_name: string;
	vendor_description: string | null;
	manager_id: number | null;
	created_at: string;
	updated_at: string;
}
