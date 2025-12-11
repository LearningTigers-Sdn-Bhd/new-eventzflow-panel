// Backend API response type (matches backend snake_case)
export type BackendItemCategory = {
	id: number;
	name: string;
	active: boolean;
	created_at: string;
	updated_at: string;
};

// Frontend item category type
export type ItemCategory = {
	id: number;
	name: string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
};

// Response types for operations
export type CreateItemCategoryResponse = {
	success: boolean;
	category: ItemCategory;
};

export type UpdateItemCategoryResponse = {
	success: boolean;
	category: ItemCategory;
};

export type DeleteItemCategoryResponse = {
	success: boolean;
	category: ItemCategory;
};

export type ToggleItemCategoryStatusResponse = {
	success: boolean;
	category: ItemCategory;
};
