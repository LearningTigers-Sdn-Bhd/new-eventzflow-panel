import { restClient } from "@/utils/rest-api";
import {
	type CreateVisitorRequest,
	createVisitorSchema,
	type UpdateVisitorRequest,
	updateVisitorSchema,
} from "./request";
import type { Visitor } from "./response";

/**
 * Get all visitors for an event
 */
export async function getVisitors(eventId: number | string, options?: { unassigned?: boolean }): Promise<Visitor[]> {
    const params = new URLSearchParams();
    if (options?.unassigned) {
        params.append("unassigned", "true");
    }
    const queryString = params.toString();
    const url = queryString ? `v1/events/${eventId}/visitors?${queryString}` : `v1/events/${eventId}/visitors`;
	return restClient.get<Visitor[]>(url);
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
 * Get a visitor by their public_id (UUID from QR code)
 * The backend supports finding by public_id in the visitors#show endpoint
 */
export async function getVisitorByPublicId(
	eventId: number,
	publicId: string,
): Promise<Visitor> {
	try {
		// Backend controller handles public_id lookup in set_visitor method
		return await restClient.get<Visitor>(
			`v1/events/${eventId}/visitors/${publicId}`,
		);
	} catch (error: unknown) {
		console.error("Error fetching visitor by public_id:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch visitor";
		throw new Error(errorMessage);
	}
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
