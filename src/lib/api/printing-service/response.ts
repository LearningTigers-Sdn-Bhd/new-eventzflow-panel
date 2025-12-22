import type { BackendItemCategory, ItemCategory } from "../item-category";

// Backend API response type (matches backend snake_case)
export type BackendPrintingService = {
	id: number;
	name: string;
	description?: string;
	unit_of_measure: string;
	default_price: number;
	status: "active" | "inactive";
	item_category_id: number;
	item_category?: BackendItemCategory;
	user_id?: number;
	image_url?: string | null;
	created_at: string;
	updated_at: string;
};

// Frontend printing service type
export type PrintingService = {
	id: number;
	name: string;
	description?: string;
	unitOfMeasure: string;
	defaultPrice: number;
	status: "active" | "inactive";
	itemCategoryId: number;
	itemCategory?: ItemCategory;
	userId?: number;
	imageUrl?: string | null;
	createdAt: string;
	updatedAt: string;
};

// Response types for operations
export type CreatePrintingServiceResponse = {
	success: boolean;
	service: PrintingService;
};

export type UpdatePrintingServiceResponse = {
	success: boolean;
	service: PrintingService;
};

export type DeletePrintingServiceResponse = {
	success: boolean;
	service: PrintingService;
};
