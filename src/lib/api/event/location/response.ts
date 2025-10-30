// Backend response type
export type BackendLocation = {
	id: number;
	name: string;
	scan_limit: number | null;
	is_unlimited: boolean;
	event_id: number;
	members: Array<{
		id: number;
		full_name: string;
		email: string;
	}>;
	created_at: string;
	updated_at: string;
};

// Frontend location type
export type Location = {
	id: string;
	name: string;
	scanLimit: number | null;
	isUnlimited: boolean;
	assignedMembers: Array<{
		id: string;
		name: string;
		email: string;
	}>;
};

// Response types for operations
export type CreateLocationResponse = Location;
export type UpdateLocationResponse = Location;
export type DeleteLocationResponse = {
	success: boolean;
};
