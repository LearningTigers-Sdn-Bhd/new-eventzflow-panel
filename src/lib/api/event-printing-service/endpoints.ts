import { restClient } from "@/utils/rest-api";
import {
	type DeleteEventPrintingServiceRequest,
	deleteEventPrintingServiceSchema,
} from "./request";
import type {
	BackendEventPrintingService,
	BackendEventPrintingServicePriceTier,
	EventPrintingService,
	EventPrintingServicePriceTier,
	DeleteEventPrintingServiceResponse,
} from "./response";

// Transform backend price tier to frontend format
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

// Transform backend response to frontend format
function transformEventPrintingService(
	backend: BackendEventPrintingService,
): EventPrintingService {
	return {
		id: backend.id,
		eventId: backend.event_id,
		printingServiceId: backend.printing_service_id,
		printingService: backend.printing_service
			? {
					id: backend.printing_service.id,
					name: backend.printing_service.name,
					description: backend.printing_service.description,
					unitOfMeasure: backend.printing_service.unit_of_measure,
					defaultPrice: Number(backend.printing_service.default_price),
					status: backend.printing_service.status,
					itemCategoryId: backend.printing_service.item_category_id,
					itemCategory: backend.printing_service.item_category
						? {
								id: backend.printing_service.item_category.id,
								name: backend.printing_service.item_category.name,
								active: backend.printing_service.item_category.active,
								createdAt: backend.printing_service.item_category.created_at,
								updatedAt: backend.printing_service.item_category.updated_at,
							}
						: undefined,
					userId: backend.printing_service.user_id,
					imageUrl: backend.printing_service.image_url,
					createdAt: backend.printing_service.created_at,
					updatedAt: backend.printing_service.updated_at,
				}
			: undefined,
		eventPrintingServicePriceTiers: backend.event_printing_service_price_tiers?.map(
			transformPriceTier,
		),
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

/**
 * Get all event printing services for a specific event
 */
export async function getEventPrintingServices(
	eventId: number,
): Promise<EventPrintingService[]> {
	try {
		const response = await restClient.get<BackendEventPrintingService[]>(
			`v1/events/${eventId}/event_printing_services`,
		);
		return response.map(transformEventPrintingService);
	} catch (error: unknown) {
		console.error("Error fetching event printing services:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to fetch event printing services";
		throw new Error(errorMessage);
	}
}

/**
 * Get a specific event printing service
 */
export async function getEventPrintingService(
	eventId: number,
	id: number,
): Promise<EventPrintingService> {
	try {
		const response = await restClient.get<BackendEventPrintingService>(
			`v1/events/${eventId}/event_printing_services/${id}`,
		);
		return transformEventPrintingService(response);
	} catch (error: unknown) {
		console.error("Error fetching event printing service:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to fetch event printing service";
		throw new Error(errorMessage);
	}
}

/**
 * Unlink a printing service from an event
 */
export async function deleteEventPrintingService(
	data: DeleteEventPrintingServiceRequest,
): Promise<DeleteEventPrintingServiceResponse> {
	try {
		const validated = deleteEventPrintingServiceSchema.parse(data);

		const response = await restClient.delete<BackendEventPrintingService>(
			`v1/events/${validated.event_id}/event_printing_services/${validated.id}`,
		);

		return {
			success: true,
			item: transformEventPrintingService(response),
		};
	} catch (error: unknown) {
		console.error("Error unlinking printing service from event:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to unlink printing service from event";
		throw new Error(errorMessage);
	}
}
