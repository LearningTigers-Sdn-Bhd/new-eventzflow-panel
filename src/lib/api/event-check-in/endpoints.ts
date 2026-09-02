/**
 * Event Check-In API Endpoints
 * All check-in operations through a single controller
 */

import { useUserSessionStore } from "@/stores/new-auth-store";
import { extractErrorMessage } from "@/utils/error-handler";
import { kyPublicClient, publicRestClient } from "@/utils/rest-api";
import type {
	AttendeePreview,
	CheckInMethod,
	CheckInResponse,
	PublicEventInfo,
} from "./types";

/**
 * Thrown when a scan/search hits a ticket that's already checked in.
 * Carries the attendee so the UI can render the "already scanned" screen
 * instead of going blank (the backend includes it precisely for this).
 */
export class CheckInBlockedError extends Error {
	attendee?: AttendeePreview;
	constructor(message: string, attendee?: AttendeePreview) {
		super(message);
		this.name = "CheckInBlockedError";
		this.attendee = attendee;
	}
}

async function parseCheckInError(
	error: unknown,
): Promise<{ message: string; attendee?: AttendeePreview }> {
	if (error && typeof error === "object" && "response" in error) {
		try {
			const httpError = error as {
				response: {
					json: () => Promise<{
						message?: string;
						errors?: { attendee?: AttendeePreview };
					}>;
				};
			};
			const body = await httpError.response.json();
			return {
				message: body.message || "Check-in failed",
				attendee: body.errors?.attendee,
			};
		} catch {
			return { message: "An error occurred. Please try again." };
		}
	}
	return { message: await extractErrorMessage(error) };
}

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
		const { message, attendee } = await parseCheckInError(error);
		throw attendee
			? new CheckInBlockedError(message, attendee)
			: new Error(message);
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

/**
 * Re-fire the scanned webhook for an attendee who's already checked in
 * (wrong name, broken ticket) so their badge prints again.
 * POST /v1/public/events/:slug/check_in/reprint
 */
export async function reprintCheckIn(
	eventSlug: string,
	publicId: string,
	checkInUrl?: string,
): Promise<CheckInResponse> {
	try {
		const payload: { value: string; check_in_url?: string } = {
			value: publicId,
		};
		if (checkInUrl) payload.check_in_url = checkInUrl;

		const response = await kyPublicClient
			.post(`v1/public/events/${eventSlug}/check_in/reprint`, {
				json: payload,
				headers: optionalAuthHeader(),
			})
			.json<{ data: CheckInResponse }>();
		return response.data;
	} catch (error: unknown) {
		const { message } = await parseCheckInError(error);
		throw new Error(message);
	}
}
