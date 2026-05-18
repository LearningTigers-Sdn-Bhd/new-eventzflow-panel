import { restClient } from "@/utils/rest-api";
import {
	type CreatePriceTierRequest,
	createPriceTierSchema,
	type DeletePriceTierRequest,
	deletePriceTierSchema,
	type UpdatePriceTierRequest,
	updatePriceTierSchema,
} from "./request";
import type {
	BackendEventRentableItemPriceTier,
	CreatePriceTierResponse,
	DeletePriceTierResponse,
	EventRentableItemPriceTier,
	UpdatePriceTierResponse,
} from "./response";

// Transform backend response to frontend format
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

/**
 * Get all price tiers for an event rentable item
 */
export async function getPriceTiers(
	eventRentableItemId: number,
): Promise<EventRentableItemPriceTier[]> {
	try {
		const response = await restClient.get<BackendEventRentableItemPriceTier[]>(
			`v1/event_rentable_items/${eventRentableItemId}/event_rentable_item_prices`,
		);
		return response.map(transformPriceTier);
	} catch (error: unknown) {
		console.error("Error fetching price tiers:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch price tiers";
		throw new Error(errorMessage);
	}
}

/**
 * Get a specific price tier
 */
export async function getPriceTier(
	eventRentableItemId: number,
	id: number,
): Promise<EventRentableItemPriceTier> {
	try {
		const response = await restClient.get<BackendEventRentableItemPriceTier>(
			`v1/event_rentable_items/${eventRentableItemId}/event_rentable_item_prices/${id}`,
		);
		return transformPriceTier(response);
	} catch (error: unknown) {
		console.error("Error fetching price tier:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch price tier";
		throw new Error(errorMessage);
	}
}

/**
 * Create a new price tier
 */
export async function createPriceTier(
	data: CreatePriceTierRequest,
): Promise<CreatePriceTierResponse> {
	try {
		const validated = createPriceTierSchema.parse(data);

		const response = await restClient.post<BackendEventRentableItemPriceTier>(
			`v1/event_rentable_items/${validated.event_rentable_item_id}/event_rentable_item_prices`,
			{
				event_rentable_item_price_tier: {
					price: validated.price,
					start_date: validated.start_date,
					end_date: validated.end_date,
					label: validated.label,
				},
			},
		);

		return {
			success: true,
			priceTier: transformPriceTier(response),
		};
	} catch (error: unknown) {
		console.error("Error creating price tier:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to create price tier";
		throw new Error(errorMessage);
	}
}

/**
 * Update an existing price tier
 */
export async function updatePriceTier(
	data: UpdatePriceTierRequest,
): Promise<UpdatePriceTierResponse> {
	try {
		const validated = updatePriceTierSchema.parse(data);

		const response = await restClient.patch<BackendEventRentableItemPriceTier>(
			`v1/event_rentable_items/${validated.event_rentable_item_id}/event_rentable_item_prices/${validated.id}`,
			{
				event_rentable_item_price_tier: {
					price: validated.price,
					start_date: validated.start_date,
					end_date: validated.end_date,
					label: validated.label,
				},
			},
		);

		return {
			success: true,
			priceTier: transformPriceTier(response),
		};
	} catch (error: unknown) {
		console.error("Error updating price tier:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to update price tier";
		throw new Error(errorMessage);
	}
}

/**
 * Delete a price tier
 */
export async function deletePriceTier(
	data: DeletePriceTierRequest,
): Promise<DeletePriceTierResponse> {
	try {
		const validated = deletePriceTierSchema.parse(data);

		const response = await restClient.delete<BackendEventRentableItemPriceTier>(
			`v1/event_rentable_items/${validated.event_rentable_item_id}/event_rentable_item_prices/${validated.id}`,
		);

		return {
			success: true,
			priceTier: transformPriceTier(response),
		};
	} catch (error: unknown) {
		console.error("Error deleting price tier:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to delete price tier";
		throw new Error(errorMessage);
	}
}
