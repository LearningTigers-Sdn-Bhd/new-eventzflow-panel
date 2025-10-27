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
 */
export async function getEvents(): Promise<Event[]> {
	const response = await restClient.get<BackendEvent[]>("v1/events");

	// Return full event data without transformation - backend already provides all fields
	return response;
}

/**
 * Create a new event
 */
export async function createEvent(data: CreateEventRequest): Promise<Event> {
	const validated = createEventSchema.parse(data); // Validate form data

	const response = await restClient.post<BackendEvent>("v1/events", validated);

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
