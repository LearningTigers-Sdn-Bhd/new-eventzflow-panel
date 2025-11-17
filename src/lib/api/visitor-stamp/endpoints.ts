import { restClient } from "@/utils/rest-api";
import type { VisitorStamp, VisitorStampWithDetails } from "./response";
import { type CreateStampRequest, createStampSchema } from "./request";

/**
 * Create a stamp (vendor scans visitor)
 */
export async function createStamp(
	publicId: string,
	data: CreateStampRequest,
): Promise<VisitorStamp> {
	const validated = createStampSchema.parse(data);
	return restClient.post<VisitorStamp>(`v1/visitors/${publicId}/stamps`, {
		stamp: validated,
	});
}

/**
 * Get all stamps for an event
 */
export async function getEventStamps(eventId: string): Promise<VisitorStampWithDetails[]> {
	return restClient.get<VisitorStampWithDetails[]>(`v1/events/${eventId}/visitor-stamps`);
}
