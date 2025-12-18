import { restClient } from "@/utils/rest-api";
import type { ExhibitorKit } from "./response";
import {
	type CreateExhibitorKitRequest,
	type UpdateExhibitorKitRequest,
	createExhibitorKitSchema,
	updateExhibitorKitSchema,
} from "./request";

/**
 * Get all exhibitor kits for an event
 */
export async function getExhibitorKits(eventId: number): Promise<ExhibitorKit[]> {
	return restClient.get<ExhibitorKit[]>(`v1/events/${eventId}/exhibitor_kits`);
}

/**
 * Get a specific exhibitor kit
 */
export async function getExhibitorKit(
	eventId: number,
	kitId: number,
): Promise<ExhibitorKit> {
	return restClient.get<ExhibitorKit>(`v1/events/${eventId}/exhibitor_kits/${kitId}`);
}

/**
 * Create an exhibitor kit with items and printings
 * Used when vendors submit their orders
 */
export async function createExhibitorKit(
	eventId: number,
	data: CreateExhibitorKitRequest,
): Promise<ExhibitorKit> {
	const validated = createExhibitorKitSchema.parse(data);
	return restClient.post<ExhibitorKit>(
		`v1/events/${eventId}/exhibitor_kits`,
		{
			exhibitor_kit: validated,
		},
	);
}

/**
 * Update an exhibitor kit
 * Used for editing booth info, payment status, team members, etc.
 */
export async function updateExhibitorKit(
	eventId: number,
	kitId: number,
	data: UpdateExhibitorKitRequest,
): Promise<ExhibitorKit> {
	const validated = updateExhibitorKitSchema.parse(data);
	return restClient.patch<ExhibitorKit>(
		`v1/events/${eventId}/exhibitor_kits/${kitId}`,
		{
			exhibitor_kit: validated,
		},
	);
}

/**
 * Submit an exhibitor kit order
 * This auto-creates a payment record for unpaid items and printings
 * and links them to the payment for tracking
 */
export async function submitExhibitorKitOrder(
	eventId: number,
	kitId: number,
): Promise<{ data: unknown; message: string }> {
	return restClient.post<{ data: unknown; message: string }>(
		`v1/events/${eventId}/exhibitor_kits/${kitId}/submit_order`,
		{},
	);
}
