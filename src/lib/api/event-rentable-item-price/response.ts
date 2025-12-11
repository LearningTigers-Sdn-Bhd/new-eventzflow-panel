// Backend API response type (matches backend snake_case)
export type BackendEventRentableItemPriceTier = {
	id: number;
	event_rentable_item_id: number;
	price: number;
	start_date: string;
	end_date?: string;
	label: string;
	created_at: string;
	updated_at: string;
};

// Frontend type
export type EventRentableItemPriceTier = {
	id: number;
	eventRentableItemId: number;
	price: number;
	startDate: string;
	endDate?: string;
	label: string;
	createdAt: string;
	updatedAt: string;
};

// Response types for operations
export type CreatePriceTierResponse = {
	success: boolean;
	priceTier: EventRentableItemPriceTier;
};

export type UpdatePriceTierResponse = {
	success: boolean;
	priceTier: EventRentableItemPriceTier;
};

export type DeletePriceTierResponse = {
	success: boolean;
	priceTier: EventRentableItemPriceTier;
};
