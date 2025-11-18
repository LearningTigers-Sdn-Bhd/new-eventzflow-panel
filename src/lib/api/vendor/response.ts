// Vendor Profile type
export type VendorProfile = {
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
};

// Backend API response type
export type BackendVendor = {
	id: string | number;
	email: string;
	full_name: string;
	phone?: string;
	role: "vendor";
	status: "active" | "inactive";
	created_at: string;
	updated_at: string;
	vendor_profile: VendorProfile | null;
};

// Frontend vendor type
export type Vendor = {
	id: string | number;
	email: string;
	full_name: string;
	phone?: string;
	role: "vendor";
	status: "active" | "inactive";
	createdAt: string;
	updatedAt: string;
	vendorProfile: VendorProfile | null;
};

// Response types for operations
export type CreateVendorResponse = {
	success: boolean;
	vendor: Vendor;
};

export type UpdateVendorResponse = {
	success: boolean;
	vendor: Vendor;
};

export type ToggleVendorStatusResponse = {
	success: boolean;
	vendor: Vendor;
};

export type DeleteVendorResponse = {
	success: boolean;
	vendor: Vendor;
};
