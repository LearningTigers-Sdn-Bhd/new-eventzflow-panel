import { restClient } from "@/utils/rest-api";
import {
	type CreatePrintingServicePriceTierRequest,
	createPrintingServicePriceTierSchema,
	type UpdatePrintingServicePriceTierRequest,
	updatePrintingServicePriceTierSchema,
	type DeletePrintingServicePriceTierRequest,
	deletePrintingServicePriceTierSchema,
} from "./request";
import type {
	BackendEventPrintingServicePriceTier,
	EventPrintingServicePriceTier,
	CreatePrintingServicePriceTierResponse,
	UpdatePrintingServicePriceTierResponse,
	DeletePrintingServicePriceTierResponse,
} from "./response";

// Transform backend response to frontend format
function transformPriceTier(
	backend: BackendEventPrintingServicePriceTier,
): EventPrintingServicePriceTier {
	return {
		id: backend.id,
		eventPrintingServiceId: backend.event_printing_service_id,
		price: Number(backend.price),
		startDate: backend.start_date,
		endDate: backend.end_date,
		label: backend.label,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

/**
 * Get all price tiers for an event printing service
 */
export async function getPrintingServicePriceTiers(
	eventPrintingServiceId: number,
): Promise<EventPrintingServicePriceTier[]> {
	try {
		const response = await restClient.get<BackendEventPrintingServicePriceTier[]>(
			`v1/event_printing_services/${eventPrintingServiceId}/event_printing_service_prices`,
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
export async function getPrintingServicePriceTier(
	eventPrintingServiceId: number,
	id: number,
): Promise<EventPrintingServicePriceTier> {
	try {
		const response = await restClient.get<BackendEventPrintingServicePriceTier>(
			`v1/event_printing_services/${eventPrintingServiceId}/event_printing_service_prices/${id}`,
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
export async function createPrintingServicePriceTier(
	data: CreatePrintingServicePriceTierRequest,
): Promise<CreatePrintingServicePriceTierResponse> {
	try {
		const validated = createPrintingServicePriceTierSchema.parse(data);

		const response = await restClient.post<BackendEventPrintingServicePriceTier>(
			`v1/event_printing_services/${validated.event_printing_service_id}/event_printing_service_prices`,
			{
				event_printing_service_price_tier: {
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
export async function updatePrintingServicePriceTier(
	data: UpdatePrintingServicePriceTierRequest,
): Promise<UpdatePrintingServicePriceTierResponse> {
	try {
		const validated = updatePrintingServicePriceTierSchema.parse(data);

		const response = await restClient.patch<BackendEventPrintingServicePriceTier>(
			`v1/event_printing_services/${validated.event_printing_service_id}/event_printing_service_prices/${validated.id}`,
			{
				event_printing_service_price_tier: {
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
export async function deletePrintingServicePriceTier(
	data: DeletePrintingServicePriceTierRequest,
): Promise<DeletePrintingServicePriceTierResponse> {
	try {
		const validated = deletePrintingServicePriceTierSchema.parse(data);

		const response = await restClient.delete<BackendEventPrintingServicePriceTier>(
			`v1/event_printing_services/${validated.event_printing_service_id}/event_printing_service_prices/${validated.id}`,
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
