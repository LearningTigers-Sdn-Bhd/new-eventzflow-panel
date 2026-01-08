// Backend response types
export type BackendPermissionContextResponse = {
	has_writer_permission: boolean;
	is_official: boolean;
	updated_at?: string;
};

// Frontend type
export type PermissionContext = {
	userId: string;
	resources: {
		hasWriterPermission: boolean;
		isOfficial: boolean;
	};
	updatedAt?: string;
};
