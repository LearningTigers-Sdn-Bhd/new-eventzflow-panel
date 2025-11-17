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
