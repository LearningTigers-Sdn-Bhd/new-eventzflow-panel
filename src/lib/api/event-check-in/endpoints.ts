/**
 * Event Check-In API Endpoints
 * All check-in operations through a single controller
 */

import { useUserSessionStore } from "@/stores/new-auth-store";
import { extractErrorMessage } from "@/utils/error-handler";
import { kyPublicClient, publicRestClient } from "@/utils/rest-api";
import type { CheckInMethod, CheckInResponse, PublicEventInfo } from "./types";

// This page is walk-up/no-login by design (kyPublicClient never attaches a
// token) — but if a staff member happens to be logged into the panel in this
// same browser (e.g. a registration counter running on a staff laptop), the
// backend can attribute and correctly gate the scan to them instead of
// leaving it anonymous. Best-effort only: an absent or expired token just
// means the page behaves exactly as it always has.
function optionalAuthHeader(): Record<string, string> {
	const { sessionCredentials, isTokenExpired } = useUserSessionStore.getState();
	if (!sessionCredentials || isTokenExpired()) return {};
	return { Authorization: `Bearer ${sessionCredentials.accessToken}` };
}

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

		const response = await kyPublicClient
			.post(`v1/public/events/${eventSlug}/check_in`, {
				json: payload,
				headers: optionalAuthHeader(),
			})
			.json<{ data: CheckInResponse }>();
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
