import { restClient } from "@/utils/rest-api";
import type {
	CreateSeatSessionRequest,
	CreateSeatSectionRequest,
	CreateSeatVenueRequest,
	CreateEventTicketSeatRequest,
	GetSeatSessionRequest,
	GetSeatSessionsRequest,
	GetSeatSectionsRequest,
	GetSeatVenuesRequest,
	GetEventTicketSeatsRequest,
	UpdateEventTicketSeatRequest,
	UpdateSeatSessionRequest,
	UpdateSeatSectionRequest,
	UpdateSeatVenueRequest,
} from "./request";
import type {
	EventSeatSession,
	EventSeatSection,
	EventSeatVenue,
	EventTicketSeat,
} from "./response";

function buildSessionParams(options?: GetSeatSessionsRequest): string {
	if (!options) return "";
	const params = new URLSearchParams();
	if (options.eventId) params.append("event_id", options.eventId);
	if (options.full) {
		params.append("full", "true");
	} else if (options.archived) {
		params.append("archived", "true");
	}
	return params.toString();
}

function appendVenueFormData(
	formData: FormData,
	data: Partial<CreateSeatVenueRequest & UpdateSeatVenueRequest>,
) {
	if (data.name !== undefined) {
		formData.append("venue[name]", data.name);
	}
	if (data.row !== undefined) {
		formData.append("venue[row]", data.row === null ? "" : String(data.row));
	}
	if (data.column !== undefined) {
		formData.append(
			"venue[column]",
			data.column === null ? "" : String(data.column),
		);
	}
	if (data.image) {
		formData.append("venue[image]", data.image);
	}
}

export async function getSeatSessions(
	options?: GetSeatSessionsRequest,
): Promise<EventSeatSession[]> {
	const queryString = buildSessionParams(options);
	const url = queryString
		? `v1/seat_ticketing/sessions?${queryString}`
		: "v1/seat_ticketing/sessions";
	return await restClient.get<EventSeatSession[]>(url);
}

export async function getSeatSession(
	data: GetSeatSessionRequest,
): Promise<EventSeatSession> {
	return await restClient.get<EventSeatSession>(
		`v1/seat_ticketing/sessions/${data.sessionId}`,
	);
}

export async function createSeatSession(
	data: CreateSeatSessionRequest,
): Promise<EventSeatSession> {
	return await restClient.post<EventSeatSession>("v1/seat_ticketing/sessions", {
		session: {
			event_id: data.event_id,
			name: data.name,
			status: data.status,
			location: data.location ?? null,
			start_datetime: data.start_datetime ?? null,
			end_datetime: data.end_datetime ?? null,
		},
	});
}

export async function updateSeatSession(
	sessionId: string,
	data: UpdateSeatSessionRequest,
): Promise<EventSeatSession> {
	return await restClient.patch<EventSeatSession>(
		`v1/seat_ticketing/sessions/${sessionId}`,
		{
			session: {
				name: data.name,
				status: data.status,
				location: data.location ?? null,
				start_datetime: data.start_datetime ?? null,
				end_datetime: data.end_datetime ?? null,
			},
		},
	);
}

export async function archiveSeatSession(sessionId: string): Promise<void> {
	await restClient.delete<void>(`v1/seat_ticketing/sessions/${sessionId}`);
}

export async function restoreSeatSession(
	sessionId: string,
): Promise<EventSeatSession> {
	return await restClient.patch<EventSeatSession>(
		`v1/seat_ticketing/sessions/${sessionId}/restore`,
	);
}

export async function forceDeleteSeatSession(sessionId: string): Promise<void> {
	await restClient.delete<void>(
		`v1/seat_ticketing/sessions/${sessionId}/force_delete`,
	);
}

export async function getSeatVenues(
	data: GetSeatVenuesRequest,
): Promise<EventSeatVenue[]> {
	return await restClient.get<EventSeatVenue[]>(
		`v1/seat_ticketing/sessions/${data.sessionId}/venues`,
	);
}

export async function getSeatVenue(
	sessionId: string,
	venueId: string,
): Promise<EventSeatVenue> {
	return await restClient.get<EventSeatVenue>(
		`v1/seat_ticketing/sessions/${sessionId}/venues/${venueId}`,
	);
}

export async function createSeatVenue(
	sessionId: string,
	data: CreateSeatVenueRequest,
): Promise<EventSeatVenue> {
	if (data.image) {
		const formData = new FormData();
		appendVenueFormData(formData, data);
		return await restClient.postFormData<EventSeatVenue>(
			`v1/seat_ticketing/sessions/${sessionId}/venues`,
			formData,
		);
	}

	return await restClient.post<EventSeatVenue>(
		`v1/seat_ticketing/sessions/${sessionId}/venues`,
		{
			venue: {
				name: data.name,
				row: data.row ?? null,
				column: data.column ?? null,
			},
		},
	);
}

export async function updateSeatVenue(
	sessionId: string,
	venueId: string,
	data: UpdateSeatVenueRequest,
): Promise<EventSeatVenue> {
	if (data.image) {
		const formData = new FormData();
		appendVenueFormData(formData, data);
		return await restClient.patchFormData<EventSeatVenue>(
			`v1/seat_ticketing/sessions/${sessionId}/venues/${venueId}`,
			formData,
		);
	}

	return await restClient.patch<EventSeatVenue>(
		`v1/seat_ticketing/sessions/${sessionId}/venues/${venueId}`,
		{
			venue: {
				name: data.name,
				row: data.row ?? null,
				column: data.column ?? null,
			},
		},
	);
}

export async function deleteSeatVenue(
	sessionId: string,
	venueId: string,
): Promise<void> {
	await restClient.delete<void>(
		`v1/seat_ticketing/sessions/${sessionId}/venues/${venueId}`,
	);
}

export async function getSeatSections(
	data: GetSeatSectionsRequest,
): Promise<EventSeatSection[]> {
	return await restClient.get<EventSeatSection[]>(
		`v1/seat_ticketing/sessions/${data.sessionId}/venues/${data.venueId}/sections`,
	);
}

export async function getSeatSection(
	sessionId: string,
	venueId: string,
	sectionId: string,
): Promise<EventSeatSection> {
	return await restClient.get<EventSeatSection>(
		`v1/seat_ticketing/sessions/${sessionId}/venues/${venueId}/sections/${sectionId}`,
	);
}

export async function createSeatSection(
	sessionId: string,
	venueId: string,
	data: CreateSeatSectionRequest,
): Promise<EventSeatSection> {
	return await restClient.post<EventSeatSection>(
		`v1/seat_ticketing/sessions/${sessionId}/venues/${venueId}/sections`,
		{
			section: {
				name: data.name,
				prize: data.prize ?? null,
				seat_row: data.seat_row ?? null,
				seat_column: data.seat_column ?? null,
				row_span: data.row_span ?? null,
				col_span: data.col_span ?? null,
			},
		},
	);
}

export async function updateSeatSection(
	sessionId: string,
	venueId: string,
	sectionId: string,
	data: UpdateSeatSectionRequest,
): Promise<EventSeatSection> {
	return await restClient.patch<EventSeatSection>(
		`v1/seat_ticketing/sessions/${sessionId}/venues/${venueId}/sections/${sectionId}`,
		{
			section: {
				name: data.name,
				prize: data.prize ?? null,
				seat_row: data.seat_row ?? null,
				seat_column: data.seat_column ?? null,
				row_span: data.row_span ?? null,
				col_span: data.col_span ?? null,
			},
		},
	);
}

export async function deleteSeatSection(
	sessionId: string,
	venueId: string,
	sectionId: string,
): Promise<void> {
	await restClient.delete<void>(
		`v1/seat_ticketing/sessions/${sessionId}/venues/${venueId}/sections/${sectionId}`,
	);
}

export async function getEventTicketSeats(
	data: GetEventTicketSeatsRequest,
): Promise<EventTicketSeat[]> {
	return await restClient.get<EventTicketSeat[]>(
		`v1/seat_ticketing/sessions/${data.sessionId}/venues/${data.venueId}/sections/${data.sectionId}/ticket-seats`,
	);
}

export async function getEventTicketSeat(
	sessionId: string,
	venueId: string,
	sectionId: string,
	seatId: string,
): Promise<EventTicketSeat> {
	return await restClient.get<EventTicketSeat>(
		`v1/seat_ticketing/sessions/${sessionId}/venues/${venueId}/sections/${sectionId}/ticket-seats/${seatId}`,
	);
}

export async function createEventTicketSeat(
	sessionId: string,
	venueId: string,
	sectionId: string,
	data: CreateEventTicketSeatRequest,
): Promise<EventTicketSeat> {
	return await restClient.post<EventTicketSeat>(
		`v1/seat_ticketing/sessions/${sessionId}/venues/${venueId}/sections/${sectionId}/ticket-seats`,
		{
			ticket_seat: {
				name: data.name,
				extra_price: data.extra_price ?? null,
				row_set: data.row_set ?? null,
				col_set: data.col_set ?? null,
				ticket_id: data.ticket_id ?? null,
			},
		},
	);
}

export async function updateEventTicketSeat(
	sessionId: string,
	venueId: string,
	sectionId: string,
	seatId: string,
	data: UpdateEventTicketSeatRequest,
): Promise<EventTicketSeat> {
	return await restClient.patch<EventTicketSeat>(
		`v1/seat_ticketing/sessions/${sessionId}/venues/${venueId}/sections/${sectionId}/ticket-seats/${seatId}`,
		{
			ticket_seat: {
				name: data.name,
				extra_price: data.extra_price ?? null,
				row_set: data.row_set ?? null,
				col_set: data.col_set ?? null,
				ticket_id: data.ticket_id ?? null,
			},
		},
	);
}

export async function deleteEventTicketSeat(
	sessionId: string,
	venueId: string,
	sectionId: string,
	seatId: string,
): Promise<void> {
	await restClient.delete<void>(
		`v1/seat_ticketing/sessions/${sessionId}/venues/${venueId}/sections/${sectionId}/ticket-seats/${seatId}`,
	);
}
