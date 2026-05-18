// Backend response types
export type BackendResourceCategory = {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
};

// Frontend type
export type ResourceCategory = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
};

// Response types
export type CreateResourceCategoryResponse = ResourceCategory;
export type UpdateResourceCategoryResponse = ResourceCategory;
