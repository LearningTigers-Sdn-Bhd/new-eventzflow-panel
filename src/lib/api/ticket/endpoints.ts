import type { BackendEvent } from "@/lib/api/event/response";
import { extractErrorMessage } from "@/utils/error-handler";
import { restClient } from "@/utils/rest-api";
import {
	checkInTicketSchema,
	createTicketSchema,
	updateTicketSchema,
} from "./request";
import type {
	BackendCheckInResponse,
	BackendTicket,
	BackendTicketTransformed,
	CheckInResponse,
	CreateTicketResponse,
	OfflineData,
	ScannedTicket,
	Ticket,
	UpdateTicketResponse,
} from "./response";

/**
 * Check in a ticket
 */
export async function checkInTicket(
	publicId: string,
): Promise<CheckInResponse> {
	console.log("🔍 Scanning ticket with ID:", publicId);

	checkInTicketSchema.parse({ publicId }); // Validate request data

	const url = `v1/tickets/${publicId}/check_in`;
	console.log("🌐 Calling PATCH:", url);

	try {
		const response = await restClient.patch<BackendCheckInResponse>(url, {});

		// Transform backend response to frontend format
		return {
			id: response.id.toString(),
			publicId: response.public_id,
			name: response.attendee_name || "Unknown Attendee",
			email: response.attendee_email,
			phone: response.attendee_phone || undefined,
			ticketTypeName: response.ticket_type_name || "General Admission",
			value: response.value || 0,
			checkedIn: response.checked_in,
			checkInAt: response.check_in_at,
			eventName: response.event_name || "Unknown Event",
			eventId: response.event_id.toString(),
		};
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Find a ticket by contact information (email, phone, or name) without checking in
 * Public endpoint - does not require authentication
 * Returns single ticket for email/phone, or multiple tickets for name searches
 */
export async function findTicketByContact(data: {
	attendee_email?: string;
	attendee_phone?: string;
	attendee_name?: string;
}): Promise<CheckInResponse | CheckInResponse[]> {
	// Validate that at least one contact method is provided
	if (!data.attendee_email && !data.attendee_phone && !data.attendee_name) {
		throw new Error("Either email, phone number, or name is required");
	}

	const url = "v1/tickets/find_by_contact";

	try {
		const response = await restClient.post<any>(url, data);

		// Check if this is a multiple matches response (name search)
		if (response.multiple_matches !== undefined && response.tickets) {
			// Transform array of tickets
			return response.tickets.map((ticket: BackendCheckInResponse) => ({
				id: ticket.id.toString(),
				publicId: ticket.public_id,
				name: ticket.attendee_name || "Unknown Attendee",
				email: ticket.attendee_email,
				phone: ticket.attendee_phone || undefined,
				ticketTypeName: ticket.ticket_type?.name || ticket.ticket_type_name || "General Admission",
				value: ticket.ticket_type?.price || ticket.value || 0,
				checkedIn: ticket.checked_in,
				checkInAt: ticket.check_in_at,
				eventName: ticket.event?.title || ticket.event_name || "Unknown Event",
				eventId: ticket.event?.id.toString() || ticket.event_id.toString(),
			}));
		}

		// Single ticket response (email/phone search)
		return {
			id: response.id.toString(),
			publicId: response.public_id,
			name: response.attendee_name || "Unknown Attendee",
			email: response.attendee_email,
			phone: response.attendee_phone || undefined,
			ticketTypeName: response.ticket_type?.name || response.ticket_type_name || "General Admission",
			value: response.ticket_type?.price || response.value || 0,
			checkedIn: response.checked_in,
			checkInAt: response.check_in_at,
			eventName: response.event?.title || response.event_name || "Unknown Event",
			eventId: response.event?.id.toString() || response.event_id.toString(),
		};
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Confirm check-in for a ticket using public_id
 * Public endpoint - does not require authentication and does not set scanned_by_id
 */
export async function confirmSelfCheckIn(publicId: string): Promise<CheckInResponse> {
	// Validate public_id is provided
	if (!publicId) {
		throw new Error("Ticket ID is required");
	}

	const url = "v1/tickets/self_check_in";

	try {
		const response = await restClient.post<BackendCheckInResponse>(url, { public_id: publicId });

		// Transform backend response to frontend format
		return {
			id: response.id.toString(),
			publicId: response.public_id,
			name: response.attendee_name || "Unknown Attendee",
			email: response.attendee_email,
			phone: response.attendee_phone || undefined,
			ticketTypeName: response.ticket_type?.name || response.ticket_type_name || "General Admission",
			value: response.ticket_type?.price || response.value || 0,
			checkedIn: response.checked_in,
			checkInAt: response.check_in_at,
			eventName: response.event?.title || response.event_name || "Unknown Event",
			eventId: response.event?.id.toString() || response.event_id.toString(),
		};
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Get tickets scanned by current authenticated user
 * Returns only tickets where scanned_by_id matches the current user's ID
 */
export async function getMyScannedTickets(
	limit = 1000,
): Promise<ScannedTicket[]> {
	try {
		// First, get current user profile to get their ID
		// Backend response structure: { success: boolean, message: string, data: { id, ... } }
		const profileResponse = await restClient.get<{
			success: boolean;
			message: string;
			data: { id: number };
		}>("v1/users/profile");
		
		if (!profileResponse.success || !profileResponse.data) {
			throw new Error(profileResponse.message || "Failed to fetch user profile");
		}
		
		const userId = profileResponse.data.id;
		
		if (!userId) {
			throw new Error("Could not get user ID from profile");
		}

		// Fetch all events the user has access to
		const events =
			await restClient.get<Array<{ id: number; title: string }>>("v1/events");

		// Fetch tickets from all events in parallel
		const ticketPromises = events.map(async (event) => {
			try {
				const tickets = await restClient.get<BackendTicket[]>(
					`v1/events/${event.id}/tickets`,
				);
				// Add event info to each ticket
				return tickets.map((ticket) => ({
					...ticket,
					eventName: event.title,
					eventId: event.id,
				}));
			} catch {
				// Silently ignore events without tickets or access errors
				return [];
			}
		});

		const allTicketsArrays = await Promise.all(ticketPromises);
		const allTickets = allTicketsArrays.flat();

		// Filter ONLY for tickets scanned BY this authenticated user
		const scannedByCurrentUser = allTickets.filter(
			(ticket) => ticket.checked_in && ticket.scanned_by_id === userId,
		);

		// Sort by check_in_at (newest first) and limit results
		const sortedTickets = scannedByCurrentUser
			.sort((a, b) => {
				const dateA = a.check_in_at ? new Date(a.check_in_at).getTime() : 0;
				const dateB = b.check_in_at ? new Date(b.check_in_at).getTime() : 0;
				return dateB - dateA;
			})
			.slice(0, limit);

		// Transform backend response to frontend format
		return sortedTickets.map((ticket) => {
			// Transform custom_fields_data to customLabels array
			const customLabels: Array<{ name: string; value: string }> = [];
			if (ticket.custom_fields_data) {
				for (const [key, value] of Object.entries(ticket.custom_fields_data)) {
					customLabels.push({ name: key, value: String(value) });
				}
			}

		return {
			id: ticket.public_id, // Use public_id for display (e.g., "ABC123")
			name: ticket.attendee_name,
			email: ticket.attendee_email,
			phone: ticket.attendee_phone || undefined,
			ticketTypeName: ticket.ticket_type?.name || "Unknown",
			ticketTypeId: ticket.ticket_type_id,
			value: ticket.ticket_type?.price || 0,
			checkedIn: ticket.checked_in,
			checkInAt: ticket.check_in_at || undefined,
			eventName: ticket.eventName,
			eventId: ticket.eventId.toString(),
			createdAt: ticket.created_at,
			customLabels: customLabels.length > 0 ? customLabels : undefined,
		};
		});
	} catch (error) {
		console.error("Error fetching scanned tickets:", error);
		throw error;
	}
}

/**
 * Get tickets for a specific event
 */
export async function getEventTickets(eventId: string): Promise<Ticket[]> {
	// Fetch event details and tickets in parallel
	const [event, response] = await Promise.all([
		restClient.get<BackendEvent>(`v1/events/${eventId}`),
		restClient.get<BackendTicket[]>(`v1/events/${eventId}/tickets`),
	]);

	// Filter to only show paid tickets (payment_status = 1 or "paid")
	const paidTickets = response.filter((ticket) => {
		// Handle both number and string payment status
		if (typeof ticket.payment_status === "number") {
			return ticket.payment_status === 1; // 1 = paid
		}
		return ticket.payment_status === "paid";
	});

	// Transform backend response to frontend format
	return paidTickets.map((ticket) => {
		// Resolve label keys to current label names from event.labels_data
		const customLabels: Array<{ name: string; value: string }> = [];
		if (ticket.custom_fields_data) {
			for (const [key, value] of Object.entries(ticket.custom_fields_data)) {
				const labelName = event.labels_data?.[key] || key;
				customLabels.push({ name: String(labelName), value: String(value) });
			}
		}

		return {
			id: ticket.id.toString(),
			publicId: ticket.public_id,
			name: ticket.attendee_name,
			email: ticket.attendee_email,
			phone: ticket.attendee_phone || undefined,
			ticketTypeName: ticket.ticket_type?.name || "Unknown",
			ticketTypeId: ticket.ticket_type_id,
			value: ticket.ticket_type?.price || 0,
			checkedIn: ticket.checked_in,
			checkInAt: ticket.check_in_at || undefined,
			eventName: event.title,
			eventId: ticket.event_id.toString(),
			status: ticket.status === "scanned" ? "scanned" : "not_scanned",
			createdAt: ticket.created_at,
			customLabels: customLabels.length > 0 ? customLabels : undefined,
		};
	});
}

/**
 * Create a new ticket
 */
export async function createTicket(data: {
	eventId: string;
	attendee_name: string;
	attendee_email?: string | null;
	attendee_phone?: string | null;
	ticket_type_id: number;
	custom_fields_data?: Record<string, string>;
	payment_status?: number;
}): Promise<CreateTicketResponse> {
	const validated = createTicketSchema.parse(data);
	const { eventId, ...ticketData } = validated;

	const response = await restClient.post<BackendTicketTransformed>(
		`v1/events/${eventId}/tickets`,
		{ ticket: ticketData },
	);

	// Transform backend response to frontend format
	return {
		id: response.id.toString(),
		publicId: response.public_id,
		name: response.attendee_name,
		email: response.attendee_email,
		phone: response.attendee_phone,
		ticketTypeName: response.ticket_type_name,
		ticketTypeId: response.ticket_type_id,
		value: response.value,
		checkedIn: response.checked_in,
		checkInAt: response.check_in_at,
		eventName: response.event_name,
		eventId: response.event_id.toString(),
		status: response.checked_in ? "scanned" : "not_scanned",
		createdAt: response.created_at || new Date().toISOString(),
		customLabels: response.custom_labels,
	};
}

/**
 * Update an existing ticket
 */
export async function updateTicket(data: {
	eventId: string;
	ticketId: string;
	attendee_name: string;
	attendee_email?: string | null;
	attendee_phone?: string | null;
	ticket_type_id: number;
	custom_fields_data?: Record<string, string>;
}): Promise<UpdateTicketResponse> {
	const validated = updateTicketSchema.parse(data);
	const { eventId, ticketId, ...ticketData } = validated;

	const response = await restClient.put<BackendTicketTransformed>(
		`v1/events/${eventId}/tickets/${ticketId}`,
		{ ticket: ticketData },
	);

	// Transform backend response to frontend format
	return {
		id: response.id.toString(),
		publicId: response.public_id,
		name: response.attendee_name,
		email: response.attendee_email,
		phone: response.attendee_phone,
		ticketTypeName: response.ticket_type_name,
		ticketTypeId: response.ticket_type_id,
		value: response.value,
		checkedIn: response.checked_in,
		checkInAt: response.check_in_at,
		eventName: response.event_name,
		eventId: response.event_id.toString(),
		status: response.checked_in ? "scanned" : "not_scanned",
		createdAt: response.created_at || new Date().toISOString(),
		customLabels: response.custom_labels,
	};
}

// Backend ticket type from v1/events/{id}/tickets endpoint
interface BackendTicketForOffline {
	id: number;
	public_id: string;
	attendee_name: string;
	attendee_email: string;
	attendee_phone?: string | null;
	ticket_type_id: number;
	event_id: number;
	status: "purchased" | "scanned" | "refunded" | "canceled";
	payment_status: "pending" | "paid" | "failed" | "refunded_payment" | number;
	checked_in: boolean;
	check_in_at: string | null;
	scanned_by_id?: number | null;
	custom_fields_data: Record<string, string> | null;
	created_at: string;
	updated_at: string;
	ticket_type?: {
		id: number;
		name: string;
		price: number;
	};
}

/**
 * Transform backend ticket to offline format
 */
function transformTicket(
	backendTicket: BackendTicketForOffline,
	eventId: number,
	eventName: string,
) {
	return {
		publicId: backendTicket.public_id,
		eventId,
		eventName,
		name: backendTicket.attendee_name,
		email: backendTicket.attendee_email,
		phone: backendTicket.attendee_phone || "",
		ticketTypeName: backendTicket.ticket_type?.name || "Unknown",
		value: backendTicket.ticket_type?.price || 0,
		checkedIn: backendTicket.checked_in,
		checkInAt: backendTicket.check_in_at,
	};
}

/**
 * Get all events and tickets for offline scanning
 * Returns all events and tickets the user has access to
 * This mirrors the tRPC endpoint behavior by fetching events first, then tickets for each event
 */
export async function getAllForOffline(): Promise<OfflineData> {
	// Fetch all events the user has access to
	const events = await restClient.get<BackendEvent[]>("v1/events");

	// Fetch tickets from all events in parallel
	const ticketPromises = events.map(async (event) => {
		try {
			const tickets = await restClient.get<BackendTicketForOffline[]>(
				`v1/events/${event.id}/tickets`,
			);
			// Add event info to each ticket
			return tickets.map((ticket) =>
				transformTicket(ticket, event.id, event.title),
			);
		} catch (_error) {
			// Silently ignore events without tickets or access errors
			return [];
		}
	});

	const allTicketsArrays = await Promise.all(ticketPromises);
	const allTickets = allTicketsArrays.flat();

	return {
		events: events.map((e) => ({ id: e.id, title: e.title })),
		tickets: allTickets,
	};
}
