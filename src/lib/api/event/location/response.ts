// Location details structure (floor is now separate)
export type LocationDetails = {
	wing?: string;
	booth_number?: string;
	zone?: string;
	notes?: string;
};

// Member type with role information
export type LocationMember = {
	id: number;
	full_name: string;
	email: string;
	role: string;
	member_type: "staff" | "vendor";
};

// Backend response type
export type BackendLocation = {
	id: number;
	name: string;
	scan_limit: number | null;
	is_unlimited: boolean;
	event_id: number;
	floor: string | null;
	location_details: LocationDetails;
	location_display_name: string;
	staff_members: LocationMember[];
	vendors: LocationMember[];
	created_at: string;
	updated_at: string;
};

// Frontend location type
export type Location = {
	id: string;
	name: string;
	scanLimit: number | null;
	isUnlimited: boolean;
	floor?: string | null;
	locationDetails: LocationDetails;
	locationDisplayName: string;
	staffMembers: Array<{
		id: string;
		name: string;
		email: string;
		role: string;
		memberType: "staff" | "vendor";
	}>;
	vendors: Array<{
		id: string;
		name: string;
		email: string;
		role: string;
		memberType: "staff" | "vendor";
	}>;
	// Keep for backward compatibility
	assignedMembers: Array<{
		id: string;
		name: string;
		email: string;
		role: string;
		memberType: "staff" | "vendor";
	}>;
};

// Response types for operations
export type CreateLocationResponse = Location;
export type UpdateLocationResponse = Location;
export type DeleteLocationResponse = {
	success: boolean;
};
