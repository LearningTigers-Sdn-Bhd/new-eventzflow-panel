// Backend response types
export type BackendResourceMediaType = {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
};

// Frontend type
export type ResourceMediaType = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

// Response types
export type CreateResourceMediaTypeResponse = ResourceMediaType;
export type UpdateResourceMediaTypeResponse = ResourceMediaType;