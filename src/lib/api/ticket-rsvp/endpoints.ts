import { restClient } from "@/utils/rest-api";
import { type TicketRsvpRequest, ticketRsvpRequestSchema } from "./request";
import type { PublicTicketRsvpResponse } from "./response";

export async function getTicketRsvp(
	data: TicketRsvpRequest,
): Promise<PublicTicketRsvpResponse> {
	const validated = ticketRsvpRequestSchema.parse(data);
	return restClient.get<PublicTicketRsvpResponse>(
		`v1/public/events/${validated.eventId}/ticket_rsvp/${validated.token}`,
	);
}

export async function confirmTicketRsvp(
	data: TicketRsvpRequest,
): Promise<PublicTicketRsvpResponse> {
	const validated = ticketRsvpRequestSchema.parse(data);
	return restClient.post<PublicTicketRsvpResponse>(
		`v1/public/events/${validated.eventId}/ticket_rsvp/${validated.token}/confirm`,
	);
}

export async function declineTicketRsvp(
	data: TicketRsvpRequest,
): Promise<PublicTicketRsvpResponse> {
	const validated = ticketRsvpRequestSchema.parse(data);
	return restClient.post<PublicTicketRsvpResponse>(
		`v1/public/events/${validated.eventId}/ticket_rsvp/${validated.token}/decline`,
	);
}
