import { restClient } from "@/utils/rest-api";
import { type RsvpRespondRequest, rsvpRespondSchema } from "./request";
import type { RsvpPageData, RsvpRespondResult } from "./response";

/**
 * Fetch RSVP page data (public, no auth)
 */
export async function getRsvpData(
	slug: string,
	publicId: string,
): Promise<RsvpPageData> {
	return restClient.get<RsvpPageData>(
		`v1/public/events/${slug}/rsvp/${publicId}`,
	);
}

/**
 * Submit RSVP response (public, no auth)
 */
export async function submitRsvpResponse(
	slug: string,
	publicId: string,
	data: RsvpRespondRequest,
): Promise<RsvpRespondResult> {
	const validated = rsvpRespondSchema.parse(data);
	return restClient.post<RsvpRespondResult>(
		`v1/public/events/${slug}/rsvp/${publicId}/respond`,
		validated,
	);
}
