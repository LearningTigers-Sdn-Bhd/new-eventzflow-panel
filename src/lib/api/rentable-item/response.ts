import type { BackendItemCategory, ItemCategory } from "../item-category";

// Backend API response type (matches backend snake_case)
export type BackendRentableItem = {
	id: number;
	name: string;
	description?: string;
	unit_of_measure: string;
	default_price: number;
	status: "active" | "inactive";
	item_category_id: number;
	item_category?: BackendItemCategory;
	user_id?: number;
	created_at: string;
	updated_at: string;
};

// Frontend rentable item type
export type RentableItem = {
	id: number;
	name: string;
	description?: string;
	unitOfMeasure: string;
	defaultPrice: number;
	status: "active" | "inactive";
	itemCategoryId: number;
	itemCategory?: ItemCategory;
	userId?: number;
	createdAt: string;
	updatedAt: string;
};

// Response types for operations
export type CreateRentableItemResponse = {
	success: boolean;
	item: RentableItem;
};

export type UpdateRentableItemResponse = {
	success: boolean;
	item: RentableItem;
};

export type DeleteRentableItemResponse = {
	success: boolean;
	item: RentableItem;
};
