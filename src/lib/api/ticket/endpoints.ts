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
	BackendImportTicketsResponse,
	BackendTicket,
	BackendTicketTransformed,
	CheckInResponse,
	CreateTicketResponse,
	ImportTicketsResponse,
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
	checkInTicketSchema.parse({ publicId });

	const url = `v1/tickets/${publicId}/check_in`;

	try {
		const response = await restClient.patch<BackendCheckInResponse>(url, {});

		// Transform backend response to frontend format
		return {
			id: response.id.toString(),
			publicId: response.public_id,
			name: response.attendee_name || "Unknown Attendee",
			email: response.attendee_email,
			phone: response.attendee_phone || undefined,
			ticketTypeName:
				response.ticket_type?.name ||
				response.ticket_type_name ||
				"General Admission",
			value:
				Number.parseFloat(String(response.ticket_type?.price)) ||
				response.value ||
				0,
			checkedIn: response.checked_in,
			checkInAt: response.check_in_at,
			eventName:
				response.event?.title || response.event_name || "Unknown Event",
			eventId: response.event?.id?.toString() || response.event_id.toString(),
		};
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Unscan a ticket (org_owner only)
 * Resets checked_in, check_in_at, scanned_by_id, and status
 */
export async function unscanTicket(ticketId: string): Promise<void> {
	console.log("🔄 Unscanning ticket with ID:", ticketId);

	const url = `v1/tickets/${ticketId}/unscan`;
	console.log("🌐 Calling PATCH:", url);

	try {
		await restClient.patch(url, {});
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
				ticketTypeName:
					ticket.ticket_type?.name ||
					ticket.ticket_type_name ||
					"General Admission",
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
			ticketTypeName:
				response.ticket_type?.name ||
				response.ticket_type_name ||
				"General Admission",
			value: response.ticket_type?.price || response.value || 0,
			checkedIn: response.checked_in,
			checkInAt: response.check_in_at,
			eventName:
				response.event?.title || response.event_name || "Unknown Event",
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
 * Optionally accepts attendee_phone, attendee_email, and check_in_url for webhook/printer integration
 */
export async function confirmSelfCheckIn(
	publicId: string,
	contactInfo?: {
		attendee_phone?: string;
		attendee_email?: string;
		check_in_url?: string;
	},
): Promise<CheckInResponse> {
	// Validate public_id is provided
	if (!publicId) {
		throw new Error("Ticket ID is required");
	}

	const url = "v1/tickets/self_check_in";

	try {
		const payload: any = { public_id: publicId };

		// Add optional contact info if provided
		if (contactInfo?.attendee_phone) {
			payload.attendee_phone = contactInfo.attendee_phone;
		}
		if (contactInfo?.attendee_email) {
			payload.attendee_email = contactInfo.attendee_email;
		}
		if (contactInfo?.check_in_url) {
			payload.check_in_url = contactInfo.check_in_url;
		}

		const response = await restClient.post<BackendCheckInResponse>(
			url,
			payload,
		);

		// Transform backend response to frontend format
		return {
			id: response.id.toString(),
			publicId: response.public_id,
			name: response.attendee_name || "Unknown Attendee",
			email: response.attendee_email,
			phone: response.attendee_phone || undefined,
			ticketTypeName:
				response.ticket_type?.name ||
				response.ticket_type_name ||
				"General Admission",
			value: response.ticket_type?.price || response.value || 0,
			checkedIn: response.checked_in,
			checkInAt: response.check_in_at,
			eventName:
				response.event?.title || response.event_name || "Unknown Event",
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
			throw new Error(
				profileResponse.message || "Failed to fetch user profile",
			);
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
 * Transform a backend ticket object to the frontend Ticket format
 */
function transformBackendTicket(
	ticket: BackendTicket | BackendTicketTransformed,
	eventTitle = "Unknown Event",
	eventId?: string,
): Ticket {
	const customLabels: Array<{ name: string; value: string }> = [];

	// Handle both raw and transformed backend formats
	const id = ticket.id.toString();
	const publicId = ticket.public_id;
	const role = ticket.role || undefined;
	const checkedIn = ticket.checked_in;
	const checkInAt = ticket.check_in_at || undefined;
	const event_id = eventId || ticket.event_id.toString();
	const status = ticket.status === "scanned" ? "scanned" : "not_scanned";
	const createdAt = ticket.created_at;

	let name = "";
	let email = "";
	let phone: string | undefined = undefined;
	let ticketTypeName = "Unknown";
	let ticketTypeId = 0;
	let value = 0;
	let deletedAt: string | null = null;

	if ("attendee_name" in ticket) {
		// BackendTicket format
		const bt = ticket as BackendTicket;
		name = bt.attendee_name;
		email = bt.attendee_email;
		phone = bt.attendee_phone || undefined;
		ticketTypeId = bt.ticket_type_id;
		ticketTypeName = bt.ticket_type?.name || "Unknown";
		value = bt.ticket_type?.price || 0;
		deletedAt = bt.deleted_at || null;

		if (bt.custom_fields_data) {
			for (const [key, val] of Object.entries(bt.custom_fields_data)) {
				customLabels.push({ name: String(key), value: String(val) });
			}
		}
	} else {
		// BackendTicketTransformed format
		const btt = ticket as BackendTicketTransformed;
		name = btt.attendee_name;
		email = btt.attendee_email;
		phone = btt.attendee_phone || undefined;
		ticketTypeId = btt.ticket_type_id;
		ticketTypeName = btt.ticket_type_name || "Unknown";
		value = btt.value || 0;

		if (btt.custom_labels) {
			customLabels.push(...btt.custom_labels);
		}
	}

	return {
		id,
		publicId,
		role,
		name,
		email,
		phone,
		ticketTypeName,
		ticketTypeId,
		value,
		checkedIn,
		checkInAt,
		eventName: eventTitle,
		eventId: event_id,
		status,
		createdAt,
		deletedAt,
		customLabels: customLabels.length > 0 ? customLabels : undefined,
	};
}

/**
 * Get tickets for a specific event
 * @param eventId - The event ID
 * @param options - Query options for filtering tickets
 * @param options.archived - If true, returns only archived tickets. If false/undefined, returns only active tickets.
 * @param options.full - If true, returns all tickets (active + archived). Overrides archived parameter.
 */
export async function getEventTickets(
	eventId: string,
	options?: {
		archived?: boolean;
		full?: boolean;
	},
): Promise<Ticket[]> {
	// Build query parameters
	const params = new URLSearchParams();
	if (options?.full) {
		params.append("full", "true");
	} else if (options?.archived) {
		params.append("archived", "true");
	}

	const queryString = params.toString();
	const ticketsUrl = queryString
		? `v1/events/${eventId}/tickets?${queryString}`
		: `v1/events/${eventId}/tickets`;

	// Fetch event details and tickets in parallel
	const [event, response] = await Promise.all([
		restClient.get<BackendEvent>(`v1/events/${eventId}`),
		restClient.get<BackendTicket[]>(ticketsUrl),
	]);

	// Transform backend response to frontend format
	return response.map((ticket) =>
		transformBackendTicket(ticket, event.title, eventId),
	);
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
	role?: string;
	payment_status?: number;
}): Promise<CreateTicketResponse> {
	const validated = createTicketSchema.parse(data);
	const { eventId, ...ticketData } = validated;

	const response = await restClient.post<BackendTicket>(
		`v1/events/${eventId}/tickets`,
		{ ticket: ticketData },
	);

	// Transform backend response to frontend format
	return transformBackendTicket(response, "Unknown Event", eventId);
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
	role?: string;
	custom_fields_data?: Record<string, string>;
}): Promise<UpdateTicketResponse> {
	const validated = updateTicketSchema.parse(data);
	const { eventId, ticketId, ...ticketData } = validated;

	const response = await restClient.put<BackendTicket>(
		`v1/events/${eventId}/tickets/${ticketId}`,
		{ ticket: ticketData },
	);

	// Transform backend response to frontend format
	return transformBackendTicket(response, "Unknown Event", eventId);
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

/**
 * Import tickets from an Excel or CSV file
 */
export async function importTickets(
	file: File,
): Promise<ImportTicketsResponse> {
	try {
		// Validate file type
		const validTypes = [
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
			"application/vnd.ms-excel", // .xls
			"text/csv", // .csv
		];
		const validExtensions = [".xlsx", ".xls", ".csv"];

		const fileExtension = file.name
			.substring(file.name.lastIndexOf("."))
			.toLowerCase();

		if (
			!validTypes.includes(file.type) &&
			!validExtensions.includes(fileExtension)
		) {
			throw new Error(
				"Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.",
			);
		}

		// Create FormData with the file
		const formData = new FormData();
		formData.append("file", file);

		// Call the import endpoint
		const response =
			await restClient.postFormData<BackendImportTicketsResponse>(
				"v1/tickets/import",
				formData,
			);

		// Transform backend response to frontend format
		return {
			created: response.data.created,
			updated: response.data.updated,
			skipped: response.data.skipped,
			duplicates_in_file: response.data.duplicates_in_file,
			errors: response.data.errors || [],
		};
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Import tickets in dry-run mode (no writes) and return detailed report
 */
export async function importTicketsDryRun(
	file: File,
): Promise<ImportTicketsResponse> {
	try {
		const formData = new FormData();
		formData.append("file", file);

		const response =
			await restClient.postFormData<BackendImportTicketsResponse>(
				"v1/tickets/import?dry_run=true",
				formData,
			);

		return {
			created: response.data.created,
			updated: response.data.updated,
			skipped: response.data.skipped,
			duplicates_in_file: response.data.duplicates_in_file,
			errors: response.data.errors || [],
		};
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Archive a ticket (soft delete)
 */
export async function archiveTicket(
	eventId: string,
	publicId: string,
): Promise<void> {
	try {
		await restClient.delete<void>(`v1/events/${eventId}/tickets/${publicId}`);
	} catch (error: any) {
		console.error("Error archiving ticket:", error);
		throw new Error(error.message || "Failed to archive ticket");
	}
}

/**
 * Force delete a ticket (permanent delete)
 */
export async function forceDeleteTicket(
	eventId: string,
	publicId: string,
): Promise<void> {
	try {
		await restClient.delete<void>(
			`v1/events/${eventId}/tickets/${publicId}/force_delete`,
		);
	} catch (error: any) {
		console.error("Error force deleting ticket:", error);
		throw new Error(error.message || "Failed to force delete ticket");
	}
}

/**
 * Restore an archived ticket
 */
export async function restoreTicket(
	eventId: string,
	publicId: string,
): Promise<Ticket> {
	try {
		const response = await restClient.patch<BackendTicketTransformed>(
			`v1/events/${eventId}/tickets/${publicId}/restore`,
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
			deletedAt: null,
			customLabels: response.custom_labels,
		};
	} catch (error: any) {
		console.error("Error restoring ticket:", error);
		throw new Error(error.message || "Failed to restore ticket");
	}
}
