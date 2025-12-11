import { restClient } from "@/utils/rest-api";
import {
	type CreateEventRentableItemRequest,
	createEventRentableItemSchema,
	type DeleteEventRentableItemRequest,
	deleteEventRentableItemSchema,
} from "./request";
import type {
	BackendEventRentableItem,
	BackendEventRentableItemPriceTier,
	EventRentableItem,
	EventRentableItemPriceTier,
	CreateEventRentableItemResponse,
	DeleteEventRentableItemResponse,
} from "./response";

// Transform backend price tier to frontend format
function transformPriceTier(
	backend: BackendEventRentableItemPriceTier,
): EventRentableItemPriceTier {
	return {
		id: backend.id,
		eventRentableItemId: backend.event_rentable_item_id,
		price: Number(backend.price),
		startDate: backend.start_date,
		endDate: backend.end_date,
		label: backend.label,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

// Transform backend response to frontend format
function transformEventRentableItem(
	backend: BackendEventRentableItem,
): EventRentableItem {
	return {
		id: backend.id,
		eventId: backend.event_id,
		rentableItemId: backend.rentable_item_id,
		rentableItem: backend.rentable_item
			? {
					id: backend.rentable_item.id,
					name: backend.rentable_item.name,
					description: backend.rentable_item.description,
					unitOfMeasure: backend.rentable_item.unit_of_measure,
					defaultPrice: Number(backend.rentable_item.default_price),
					status: backend.rentable_item.status,
					itemCategoryId: backend.rentable_item.item_category_id,
					itemCategory: backend.rentable_item.item_category
						? {
								id: backend.rentable_item.item_category.id,
								name: backend.rentable_item.item_category.name,
								active: backend.rentable_item.item_category.active,
								createdAt: backend.rentable_item.item_category.created_at,
								updatedAt: backend.rentable_item.item_category.updated_at,
							}
						: undefined,
					userId: backend.rentable_item.user_id,
					createdAt: backend.rentable_item.created_at,
					updatedAt: backend.rentable_item.updated_at,
				}
			: undefined,
		eventRentableItemPriceTiers: backend.event_rentable_item_price_tiers?.map(
			transformPriceTier,
		),
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

/**
 * Get all event rentable items for a specific event
 */
export async function getEventRentableItems(
	eventId: number,
): Promise<EventRentableItem[]> {
	try {
		const response = await restClient.get<BackendEventRentableItem[]>(
			`v1/events/${eventId}/event_rentable_items`,
		);
		return response.map(transformEventRentableItem);
	} catch (error: unknown) {
		console.error("Error fetching event rentable items:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to fetch event rentable items";
		throw new Error(errorMessage);
	}
}

/**
 * Get a specific event rentable item
 */
export async function getEventRentableItem(
	eventId: number,
	id: number,
): Promise<EventRentableItem> {
	try {
		const response = await restClient.get<BackendEventRentableItem>(
			`v1/events/${eventId}/event_rentable_items/${id}`,
		);
		return transformEventRentableItem(response);
	} catch (error: unknown) {
		console.error("Error fetching event rentable item:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to fetch event rentable item";
		throw new Error(errorMessage);
	}
}

/**
 * Link a rentable item to an event
 */
export async function createEventRentableItem(
	data: CreateEventRentableItemRequest,
): Promise<CreateEventRentableItemResponse> {
	try {
		const validated = createEventRentableItemSchema.parse(data);

		const response = await restClient.post<BackendEventRentableItem>(
			`v1/events/${validated.event_id}/event_rentable_items`,
			{
				rentable_item_id: validated.rentable_item_id,
			},
		);

		return {
			success: true,
			item: transformEventRentableItem(response),
		};
	} catch (error: unknown) {
		console.error("Error linking rentable item to event:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to link rentable item to event";
		throw new Error(errorMessage);
	}
}

/**
 * Unlink a rentable item from an event
 */
export async function deleteEventRentableItem(
	data: DeleteEventRentableItemRequest,
): Promise<DeleteEventRentableItemResponse> {
	try {
		const validated = deleteEventRentableItemSchema.parse(data);

		const response = await restClient.delete<BackendEventRentableItem>(
			`v1/events/${validated.event_id}/event_rentable_items/${validated.id}`,
		);

		return {
			success: true,
			item: transformEventRentableItem(response),
		};
	} catch (error: unknown) {
		console.error("Error unlinking rentable item from event:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to unlink rentable item from event";
		throw new Error(errorMessage);
	}
}
