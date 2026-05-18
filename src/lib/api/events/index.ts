// new-eventzflow-panel/src/lib/api/events/index.ts
import { restClient } from "@/utils/rest-api";

export interface EventDetails {
	id: string;
	title: string;
	description: string;
	start_date: string;
	end_date: string;
	// Add other relevant fields as needed
}

export async function getEventDetails(eventId: string): Promise<EventDetails> {
	const url = `v1/events/${eventId}`;
	return restClient.get<EventDetails>(url);
}
