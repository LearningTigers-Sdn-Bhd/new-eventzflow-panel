import { restClient } from "@/utils/rest-api";
import type { StampAnalytics } from "./response";

/**
 * Get stamp count for a vendor in an event
 * @param eventId - The event ID
 * @param eventVendorId - The event_vendor ID (from event_vendors table, NOT the user's vendor_id)
 */
export async function getStampCount(
	eventId: number,
	eventVendorId: number,
): Promise<StampAnalytics> {
	return restClient.get<StampAnalytics>(
		`v1/events/${eventId}/vendors/${eventVendorId}/stamp_count`,
	);
}
