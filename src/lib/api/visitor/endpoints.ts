import { restClient } from "@/utils/rest-api";
import type { Visitor } from "./response";
import {
	type CreateVisitorRequest,
	type UpdateVisitorRequest,
	createVisitorSchema,
	updateVisitorSchema,
} from "./request";

/**
 * Get all visitors for an event
 */
export async function getVisitors(eventId: number): Promise<Visitor[]> {
	return restClient.get<Visitor[]>(`v1/events/${eventId}/visitors`);
}

/**
 * Get a specific visitor
 */
export async function getVisitor(
	eventId: number,
	visitorId: number,
): Promise<Visitor> {
	return restClient.get<Visitor>(`v1/events/${eventId}/visitors/${visitorId}`);
}

/**
 * Create a new visitor (webhook endpoint)
 */
export async function createVisitor(
	eventId: number,
	data: CreateVisitorRequest,
): Promise<Visitor> {
	const validated = createVisitorSchema.parse(data);
	return restClient.post<Visitor>(`v1/events/${eventId}/visitors`, {
		visitor: validated,
	});
}

/**
 * Update a visitor
 */
export async function updateVisitor(
	eventId: number,
	visitorId: number,
	data: UpdateVisitorRequest,
): Promise<Visitor> {
	const validated = updateVisitorSchema.parse(data);
	return restClient.patch<Visitor>(
		`v1/events/${eventId}/visitors/${visitorId}`,
		{ visitor: validated },
	);
}

/**
 * Delete a visitor
 */
export async function deleteVisitor(
	eventId: number,
	visitorId: number,
): Promise<void> {
	await restClient.delete<void>(`v1/events/${eventId}/visitors/${visitorId}`);
}
