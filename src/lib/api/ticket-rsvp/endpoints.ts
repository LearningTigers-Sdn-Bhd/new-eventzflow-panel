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

export async function getTicketRsvpServer(
	data: TicketRsvpRequest,
): Promise<PublicTicketRsvpResponse> {
	const validated = ticketRsvpRequestSchema.parse(data);
	const baseUrl =
		process.env.API_URL ||
		process.env.NEXT_PUBLIC_API_URL ||
		"http://localhost:3000";
	const res = await fetch(
		`${baseUrl}/v1/public/events/${validated.eventId}/ticket_rsvp/${validated.token}`,
		{ cache: "no-store" },
	);
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error((body as { message?: string })?.message || "Not found");
	}
	return res.json() as Promise<PublicTicketRsvpResponse>;
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
