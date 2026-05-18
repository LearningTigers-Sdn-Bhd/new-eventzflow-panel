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
	BackendTicketTypePriceTier,
	CreatePriceTierResponse,
	DeletePriceTierResponse,
	TicketTypePriceTier,
	UpdatePriceTierResponse,
} from "./response";

// Transform backend response to frontend format
function transformPriceTier(
	backend: BackendTicketTypePriceTier,
): TicketTypePriceTier {
	return {
		id: backend.id,
		label: backend.label,
		price: Number(backend.price),
		startsAt: backend.starts_at,
		endsAt: backend.ends_at,
		active: backend.active,
	};
}

/**
 * Get all price tiers for a ticket type
 */
export async function getTicketTypePriceTiers(
	ticketTypeId: number,
): Promise<TicketTypePriceTier[]> {
	try {
		const response = await restClient.get<{
			success: boolean;
			data: BackendTicketTypePriceTier[];
		}>(`v1/ticket_types/${ticketTypeId}/price_tiers`);
		return response.data.map(transformPriceTier);
	} catch (error: unknown) {
		console.error("Error fetching price tiers:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch price tiers";
		throw new Error(errorMessage);
	}
}

/**
 * Create a new price tier
 */
export async function createTicketTypePriceTier(
	data: CreatePriceTierRequest,
): Promise<CreatePriceTierResponse> {
	try {
		const validated = createPriceTierSchema.parse(data);

		const response = await restClient.post<{
			success: boolean;
			data: BackendTicketTypePriceTier;
		}>(`v1/ticket_types/${validated.ticketTypeId}/price_tiers`, {
			label: validated.label,
			price: validated.price,
			starts_at: validated.starts_at,
			ends_at: validated.ends_at,
		});

		return {
			success: true,
			priceTier: transformPriceTier(response.data),
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
export async function updateTicketTypePriceTier(
	data: UpdatePriceTierRequest,
): Promise<UpdatePriceTierResponse> {
	try {
		const validated = updatePriceTierSchema.parse(data);

		const response = await restClient.patch<{
			success: boolean;
			data: BackendTicketTypePriceTier;
		}>(
			`v1/ticket_types/${validated.ticketTypeId}/price_tiers/${validated.id}`,
			{
				label: validated.label,
				price: validated.price,
				starts_at: validated.starts_at,
				ends_at: validated.ends_at,
			},
		);

		return {
			success: true,
			priceTier: transformPriceTier(response.data),
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
export async function deleteTicketTypePriceTier(
	data: DeletePriceTierRequest,
): Promise<DeletePriceTierResponse> {
	try {
		const validated = deletePriceTierSchema.parse(data);

		await restClient.delete(
			`v1/ticket_types/${validated.ticketTypeId}/price_tiers/${validated.id}`,
		);

		return { success: true };
	} catch (error: unknown) {
		console.error("Error deleting price tier:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to delete price tier";
		throw new Error(errorMessage);
	}
}
