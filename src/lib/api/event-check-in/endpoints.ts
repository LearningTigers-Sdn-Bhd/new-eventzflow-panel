/**
 * Event Check-In API Endpoints
 * All check-in operations through a single controller
 */

import { extractErrorMessage } from "@/utils/error-handler";
import { publicRestClient } from "@/utils/rest-api";
import type { CheckInMethod, CheckInResponse, PublicEventInfo } from "./types";

/**
 * Get event info for check-in page
 * GET /v1/public/events/:slug/check_in
 */
export async function getCheckInEvent(slug: string): Promise<PublicEventInfo> {
	try {
		const response = await publicRestClient.get<{ data: PublicEventInfo }>(
			`v1/public/events/${slug}/check_in`,
		);
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Search or check-in
 * POST /v1/public/events/:slug/check_in
 */
export async function checkIn(
	eventSlug: string,
	method: CheckInMethod,
	value: string,
	checkInUrl?: string,
): Promise<CheckInResponse> {
	try {
		const payload: {
			method: CheckInMethod;
			value: string;
			check_in_url?: string;
		} = { method, value };

		// Include check_in_url for webhook/printer integration
		if (checkInUrl) {
			payload.check_in_url = checkInUrl;
		}

		const response = await publicRestClient.post<{ data: CheckInResponse }>(
			`v1/public/events/${eventSlug}/check_in`,
			payload,
		);
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Confirm check-in for a specific attendee
 * @param checkInUrl - URL with station info for webhook/printer integration
 */
export async function confirmCheckIn(
	eventSlug: string,
	publicId: string,
	checkInUrl?: string,
): Promise<CheckInResponse> {
	return checkIn(eventSlug, "scan", publicId, checkInUrl);
}
