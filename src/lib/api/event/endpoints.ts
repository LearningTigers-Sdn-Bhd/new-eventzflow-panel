import { restClient } from "@/utils/rest-api";
import {
	type CreateEventRequest,
	createEventSchema,
	type UpdateEventRequest,
	updateEventSchema,
} from "./request";
import type { BackendEvent, Event, EventDetails } from "./response";

/**
 * Get all events
 * @param options - Query options for filtering events
 * @param options.archived - If true, returns only archived events. If false/undefined, returns only active events.
 * @param options.full - If true, returns all events (active + archived). Overrides archived parameter.
 */
export async function getEvents(options?: {
	archived?: boolean;
	full?: boolean;
}): Promise<Event[]> {
	const params = new URLSearchParams();

	if (options?.full) {
		params.append("full", "true");
	} else if (options?.archived) {
		params.append("archived", "true");
	}

	const queryString = params.toString();
	const url = queryString ? `v1/events?${queryString}` : "v1/events";

	const response = await restClient.get<BackendEvent[]>(url);

	// Return full event data without transformation - backend already provides all fields
	return response;
}

/**
 * Create a new event
 */
export async function createEvent(data: CreateEventRequest): Promise<Event> {
	const validated = createEventSchema.parse(data); // Validate form data

	const response = await restClient.post<BackendEvent>("v1/events", {
		event: validated,
	});

	// Return full event data without transformation
	return response;
}

/**
 * Update an existing event
 */
export async function updateEvent(
	eventId: string,
	data: UpdateEventRequest,
): Promise<Event> {
	const validated = updateEventSchema.parse(data); // Validate form data

	const response = await restClient.put<BackendEvent>(
		`v1/events/${eventId}`,
		validated,
	);

	// Return full event data without transformation
	return response;
}

/**
 * Get event details by ID
 */
export async function getEventById(eventId: string): Promise<EventDetails> {
	const response = await restClient.get<EventDetails>(`v1/events/${eventId}`);

	// Return the full event details response
	return response;
}

/**
 * Archive an event
 */
export async function archiveEvent(eventId: string): Promise<void> {
	try {
		await restClient.delete<void>(`v1/events/${eventId}`);
	} catch (error: any) {
		console.error("Error archiving event:", error);
		throw new Error(error.message || "Failed to archive event");
	}
}

/**
 * Force delete an event
 */
export async function forceDeleteEvent(eventId: string): Promise<void> {
	try {
		await restClient.delete<void>(`v1/events/${eventId}/force_delete`);
	} catch (error: any) {
		console.error("Error force deleting event:", error);
		throw new Error(error.message || "Failed to force delete event");
	}
}

/**
 * Restore an archived event
 */
export async function restoreEvent(eventId: string): Promise<Event> {
	try {
		const response = await restClient.patch<BackendEvent>(
			`v1/events/${eventId}/restore`,
		);
		return response;
	} catch (error: any) {
		console.error("Error restoring event:", error);
		throw new Error(error.message || "Failed to restore event");
	}
}
