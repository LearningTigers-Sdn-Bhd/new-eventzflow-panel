import type { BackendRentableItem, RentableItem } from "../rentable-item";

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

export type BackendEventRentableItem = {
	id: number;
	event_id: number;
	rentable_item_id: number;
	rentable_item?: BackendRentableItem;
	event_rentable_item_price_tiers?: BackendEventRentableItemPriceTier[];
	created_at: string;
	updated_at: string;
};

// Frontend types
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

export type EventRentableItem = {
	id: number;
	eventId: number;
	rentableItemId: number;
	rentableItem?: RentableItem;
	eventRentableItemPriceTiers?: EventRentableItemPriceTier[];
	createdAt: string;
	updatedAt: string;
};

// Response types for operations
export type DeleteEventRentableItemResponse = {
	success: boolean;
	item: EventRentableItem;
};
