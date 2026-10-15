import { restClient } from "@/utils/rest-api";
import {
	type CreateTicketTypeRequest,
	createTicketTypeSchema,
	type DeleteTicketTypeRequest,
	deleteTicketTypeSchema,
	type GetEventTicketTypesRequest,
	type GetTicketTypeRequest,
	getEventTicketTypesSchema,
	getTicketTypeSchema,
	type UpdateTicketTypeRequest,
	updateTicketTypeSchema,
} from "./request";
import type {
	BackendTicketType,
	CreateTicketTypeResponse,
	DeleteTicketTypeResponse,
	TicketType,
	UpdateTicketTypeResponse,
} from "./response";

// Transform backend ticket type to frontend format
function transformTicketType(backendType: BackendTicketType): TicketType {
	return {
		id: backendType.id,
		eventId: backendType.event_id,
		name: backendType.name,
		price: Number.parseFloat(backendType.price),
		quantity: backendType.quantity,
		remainingQuantity: backendType.remaining_quantity,
		maxPerOrder: backendType.max_per_order,
		saleStartsAt: backendType.sale_starts_at,
		saleEndsAt: backendType.sale_ends_at,
		status: backendType.status,
		hidden: backendType.hidden,
		customFieldsData: backendType.custom_fields_data,
		createdAt: backendType.created_at,
		updatedAt: backendType.updated_at,
	};
}

/**
 * Get ticket types for a specific event
 */
export async function getEventTicketTypes(
	data: GetEventTicketTypesRequest,
): Promise<TicketType[]> {
	try {
		const validated = getEventTicketTypesSchema.parse(data);

		const response = await restClient.get<BackendTicketType[]>(
			`v1/events/${validated.eventId}/ticket_types`,
		);

		return response.map(transformTicketType);
	} catch (error: any) {
		console.error("Error fetching event ticket types:", error);
		throw new Error(error.message || "Failed to fetch ticket types");
	}
}

/**
 * Get global ticket types (where event_id is null)
 * These are ticket type templates that can be used across events
 */
export async function getGlobalTicketTypes(): Promise<TicketType[]> {
	try {
		const response =
			await restClient.get<BackendTicketType[]>("v1/ticket_types");
		return response.map(transformTicketType);
	} catch (error: any) {
		console.error("Error fetching global ticket types:", error);
		throw new Error(error.message || "Failed to fetch global ticket types");
	}
}

/**
 * Get a single ticket type
 */
export async function getTicketType(
	data: GetTicketTypeRequest,
): Promise<TicketType> {
	try {
		const validated = getTicketTypeSchema.parse(data);

		const response = await restClient.get<BackendTicketType>(
			`v1/events/${validated.eventId}/ticket_types/${validated.ticketTypeId}`,
		);

		return transformTicketType(response);
	} catch (error: any) {
		console.error("Error fetching ticket type:", error);
		throw new Error(error.message || "Failed to fetch ticket type");
	}
}

/**
 * Create ticket type
 */
export async function createTicketType(
	data: CreateTicketTypeRequest,
): Promise<CreateTicketTypeResponse> {
	try {
		const validated = createTicketTypeSchema.parse(data);
		const { eventId, ...ticketTypeData } = validated;

		const response = await restClient.post<BackendTicketType>(
			`v1/events/${eventId}/ticket_types`,
			{ ticket_type: ticketTypeData },
		);

		return transformTicketType(response);
	} catch (error: any) {
		console.error("Error creating ticket type:", error);
		throw new Error(error.message || "Failed to create ticket type");
	}
}

/**
 * Update ticket type
 */
export async function updateTicketType(
	data: UpdateTicketTypeRequest,
): Promise<UpdateTicketTypeResponse> {
	try {
		const validated = updateTicketTypeSchema.parse(data);
		const { eventId, ticketTypeId, ...updateData } = validated;

		const response = await restClient.put<BackendTicketType>(
			`v1/events/${eventId}/ticket_types/${ticketTypeId}`,
			{ ticket_type: updateData },
		);

		return transformTicketType(response);
	} catch (error: any) {
		console.error("Error updating ticket type:", error);
		throw new Error(error.message || "Failed to update ticket type");
	}
}

/**
 * Delete ticket type
 */
export async function deleteTicketType(
	data: DeleteTicketTypeRequest,
): Promise<DeleteTicketTypeResponse> {
	try {
		const validated = deleteTicketTypeSchema.parse(data);

		await restClient.delete(
			`v1/events/${validated.eventId}/ticket_types/${validated.ticketTypeId}`,
		);

		return { success: true };
	} catch (error: any) {
		console.error("Error deleting ticket type:", error);
		throw new Error(error.message || "Failed to delete ticket type");
	}
}
