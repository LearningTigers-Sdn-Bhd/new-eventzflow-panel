import { restClient } from "@/utils/rest-api";
import type { StampAnalytics } from "./response";

/**
 * Get stamp count for a vendor
 */
export async function getStampCount(
	eventId: number,
	vendorId: number,
): Promise<StampAnalytics> {
	return restClient.get<StampAnalytics>(
		`v1/events/${eventId}/vendors/${vendorId}/stamp_count`,
	);
}
