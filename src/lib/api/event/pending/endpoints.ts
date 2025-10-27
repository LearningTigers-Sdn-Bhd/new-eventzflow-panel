import { restClient } from "@/utils/rest-api";
import {
	type CreatePendingTicketRequest,
	createPendingTicketSchema,
	type GetPendingTicketsRequest,
	getPendingTicketsSchema,
	type UpdatePendingTicketRequest,
	updatePendingTicketSchema,
} from "./request";
import type {
	BackendPendingTicket,
	CreatePendingTicketResponse,
	PendingTicket,
	UpdatePendingTicketResponse,
} from "./response";

// Transform backend ticket to frontend PendingTicket format
function transformPendingTicket(
	backendTicket: BackendPendingTicket,
): PendingTicket {
	const customLabels: Array<{ name: string; value: string }> = [];

	// Transform custom_fields_data to customLabels array
	if (backendTicket.custom_fields_data) {
		for (const [key, value] of Object.entries(
			backendTicket.custom_fields_data,
		)) {
			customLabels.push({ name: key, value: String(value) });
		}
	}

	// Convert payment_status to string if it's a number (backend enum)
	let paymentStatus: PendingTicket["paymentStatus"];
	if (typeof backendTicket.payment_status === "string") {
		paymentStatus =
			backendTicket.payment_status as PendingTicket["paymentStatus"];
	} else {
		// Map number to backend enum string
		const statusMap: Record<number, PendingTicket["paymentStatus"]> = {
			0: "pending",
			1: "paid",
			2: "failed",
			3: "refunded_payment",
		};
		paymentStatus = statusMap[backendTicket.payment_status] || "pending";
	}

	return {
		id: backendTicket.public_id,
		name: backendTicket.attendee_name,
		email: backendTicket.attendee_email,
		phone: backendTicket.attendee_phone || "",
		value: backendTicket.ticket_type?.price || 0,
		status: backendTicket.status === "scanned" ? "scanned" : "not_scanned",
		customLabels,
		createdAt: backendTicket.created_at,
		paymentStatus,
		paymentScreenshotUrl: backendTicket.payment_screenshot_url || undefined,
		transactionId: backendTicket.transaction_id || undefined,
		paymentMethod: backendTicket.payment_method || undefined,
		ticketTypeName: backendTicket.ticket_type?.name,
		ticketTypeId: backendTicket.ticket_type?.id,
	};
}

/**
 * Get all pending tickets for an event (payment_status = pending or approval_pending)
 */
export async function getPendingTickets(
	data: GetPendingTicketsRequest,
): Promise<PendingTicket[]> {
	try {
		const validated = getPendingTicketsSchema.parse(data);

		// Fetch all tickets for the event
		const response = await restClient.get<BackendPendingTicket[]>(
			`v1/events/${validated.eventId}/tickets`,
		);

		// Filter tickets:
		// 1. Include all tickets where payment_status is NOT paid (0, 2, 3 or "pending", "failed", "refunded_payment")
		// 2. Include paid tickets (1 or "paid") ONLY if transaction_id is NOT NULL
		const pendingTickets = response.filter((ticket) => {
			// Handle both number and string payment status
			if (typeof ticket.payment_status === "number") {
				// If paid (1), only include if transaction_id exists
				if (ticket.payment_status === 1) {
					return ticket.transaction_id != null && ticket.transaction_id !== "";
				}
				// Include pending (0), failed (2), refunded_payment (3)
				return (
					ticket.payment_status === 0 ||
					ticket.payment_status === 2 ||
					ticket.payment_status === 3
				);
			}
			// Handle string payment status
			if (ticket.payment_status === "paid") {
				return ticket.transaction_id != null && ticket.transaction_id !== "";
			}
			return (
				ticket.payment_status === "pending" ||
				ticket.payment_status === "failed" ||
				ticket.payment_status === "refunded_payment"
			);
		});

		return pendingTickets.map(transformPendingTicket);
	} catch (error: any) {
		console.error("Error fetching pending tickets:", error);
		throw new Error(error.message || "Failed to fetch pending tickets");
	}
}

/**
 * Create a pending ticket
 */
export async function createPendingTicket(
	data: CreatePendingTicketRequest,
): Promise<CreatePendingTicketResponse> {
	try {
		const validated = createPendingTicketSchema.parse(data);
		const { eventId, ...ticketData } = validated;

		const response = await restClient.post<BackendPendingTicket>(
			`v1/events/${eventId}/tickets`,
			{ ticket: ticketData },
		);

		return transformPendingTicket(response);
	} catch (error: any) {
		console.error("Error creating pending ticket:", error);
		throw new Error(error.message || "Failed to create pending ticket");
	}
}

/**
 * Update a pending ticket
 */
export async function updatePendingTicket(
	data: UpdatePendingTicketRequest,
): Promise<UpdatePendingTicketResponse> {
	try {
		const validated = updatePendingTicketSchema.parse(data);
		const { eventId, ticketId, ...updateData } = validated;

		const response = await restClient.put<BackendPendingTicket>(
			`v1/events/${eventId}/tickets/${ticketId}`,
			{ ticket: updateData },
		);

		return transformPendingTicket(response);
	} catch (error: any) {
		console.error("Error updating pending ticket:", error);
		throw new Error(error.message || "Failed to update pending ticket");
	}
}
