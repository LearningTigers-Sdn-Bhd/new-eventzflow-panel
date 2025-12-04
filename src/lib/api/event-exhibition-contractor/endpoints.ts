import { restClient } from "@/utils/rest-api";
import type { EventExhibitionContractor } from "./response";
import {
	type AssignContractorRequest,
	assignContractorSchema,
} from "./request";

/**
 * Get the assigned exhibition contractor for an event
 */
export async function getEventExhibitionContractor(
	eventId: number,
): Promise<EventExhibitionContractor | null> {
	try {
		return await restClient.get<EventExhibitionContractor>(
			`v1/events/${eventId}/event_exhibition_contractor`,
		);
	} catch (error) {
		// Return null if no contractor is assigned (404)
		return null;
	}
}

/**
 * Assign an exhibition contractor to an event
 * Note: This also auto-enables use_exhibitor_kit on the event
 */
export async function assignEventExhibitionContractor(
	eventId: number,
	data: AssignContractorRequest,
): Promise<EventExhibitionContractor> {
	const validated = assignContractorSchema.parse(data);
	return restClient.post<EventExhibitionContractor>(
		`v1/events/${eventId}/event_exhibition_contractor`,
		{
			event_exhibition_contractor: validated,
		},
	);
}

/**
 * Remove the exhibition contractor from an event
 * Note: This also auto-disables use_exhibitor_kit on the event
 */
export async function removeEventExhibitionContractor(
	eventId: number,
): Promise<void> {
	await restClient.delete<void>(
		`v1/events/${eventId}/event_exhibition_contractor`,
	);
}
