// Backend response types
export type BackendResourcePermission = {
	id: number;
	user_id: number;
	status: "base" | "partnership";
	is_official: boolean;
	created_at: string;
	updated_at: string;
	user?: {
		id: number;
		full_name: string;
		email: string;
		phone?: string;
	};
};

// Frontend type - keep user as object
export type ResourcePermission = {
	id: string;
	user: {
		id: string;
		fullName: string;
		email: string;
		phone?: string;
	};
	status: "base" | "partnership";
	isOfficial: boolean;
	createdAt: string;
	updatedAt: string;
};

// Response types
export type CreateResourcePermissionResponse = ResourcePermission;
export type UpdateResourcePermissionResponse = ResourcePermission;
export type BulkCreateResourcePermissionResponse = ResourcePermission[];
