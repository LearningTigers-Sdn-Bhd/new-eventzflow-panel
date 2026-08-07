import { formatTicketCustomFieldEntries } from "@/lib/utils/custom-fields-display";
import { restClient } from "@/utils/rest-api";
import {
	type AcceptWaitingListRequest,
	type ApproveTicketApplicationRequest,
	type ApproveTicketRsvpRequest,
	acceptWaitingListSchema,
	approveTicketApplicationSchema,
	approveTicketRsvpSchema,
	type CreatePendingTicketRequest,
	createPendingTicketSchema,
	type GetPendingTicketsRequest,
	getPendingTicketsSchema,
	type RejectTicketApplicationRequest,
	type ResendTicketRsvpRequest,
	rejectTicketApplicationSchema,
	resendTicketRsvpSchema,
	type UpdatePendingTicketRequest,
	updatePendingTicketSchema,
} from "./request";
import type {
	BackendPendingTicket,
	CreatePendingTicketResponse,
	PendingTicket,
	UpdatePendingTicketResponse,
} from "./response";

function getErrorMessage(error: unknown, fallback: string): string {
	return error instanceof Error && error.message ? error.message : fallback;
}

// Transform backend ticket to frontend PendingTicket format
function transformPendingTicket(
	backendTicket: BackendPendingTicket,
): PendingTicket {
	const customLabels = formatTicketCustomFieldEntries(
		backendTicket.custom_fields_data,
	);

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

	const application = backendTicket.ticket_application;

	return {
		id: backendTicket.public_id,
		publicId: backendTicket.public_id,
		name: backendTicket.attendee_name,
		email: backendTicket.attendee_email,
		phone: backendTicket.attendee_phone || "",
		role: backendTicket.role || null,
		value: backendTicket.ticket_type?.price || 0,
		status: backendTicket.status === "scanned" ? "scanned" : "not_scanned",
		customLabels,
		createdAt: backendTicket.created_at,
		paymentStatus,
		waitingList: backendTicket.waiting_list,
		paymentScreenshotUrl: backendTicket.payment_screenshot_url || undefined,
		transactionId: backendTicket.transaction_id || undefined,
		paymentMethod: backendTicket.payment_method || undefined,
		ticketTypeName: backendTicket.ticket_type?.name,
		ticketTypeId: backendTicket.ticket_type?.id,
		ticketApplication: application
			? {
					reviewStatus: application.review_status,
					rsvpStatus: application.rsvp_status,
					reviewedAt: application.reviewed_at,
					rejectionReason: application.rejection_reason,
					rsvpSentAt: application.rsvp_sent_at,
					rsvpConfirmedAt: application.rsvp_confirmed_at,
					rsvpExpiresAt: application.rsvp_expires_at,
				}
			: undefined,
		documents: backendTicket.registration_documents_data,
		vehicleRegistration: backendTicket.vehicle_registration_data
			? {
					plate: backendTicket.vehicle_registration_data.plate,
					registrationFormId:
						backendTicket.vehicle_registration_data.registration_form_id,
					registrationFormName:
						backendTicket.vehicle_registration_data.registration_form_name,
					registrationFormSlug:
						backendTicket.vehicle_registration_data.registration_form_slug,
				}
			: null,
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
		// Pending Tickets should only show non-paid payment states.
		const pendingTickets = response.filter((ticket) => {
			// Handle both number and string payment status
			if (typeof ticket.payment_status === "number") {
				// Include pending (0), failed (2), refunded_payment (3)
				return (
					ticket.payment_status === 0 ||
					ticket.payment_status === 2 ||
					ticket.payment_status === 3
				);
			}
			// Handle string payment status
			return (
				ticket.payment_status === "pending" ||
				ticket.payment_status === "failed" ||
				ticket.payment_status === "refunded_payment"
			);
		});

		return pendingTickets.map(transformPendingTicket);
	} catch (error: unknown) {
		console.error("Error fetching pending tickets:", error);
		throw new Error(getErrorMessage(error, "Failed to fetch pending tickets"));
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
	} catch (error: unknown) {
		console.error("Error creating pending ticket:", error);
		throw new Error(getErrorMessage(error, "Failed to create pending ticket"));
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
	} catch (error: unknown) {
		console.error("Error updating pending ticket:", error);
		throw new Error(getErrorMessage(error, "Failed to update pending ticket"));
	}
}

export async function approveTicketApplication(
	data: ApproveTicketApplicationRequest,
): Promise<PendingTicket> {
	const validated = approveTicketApplicationSchema.parse(data);
	const response = await restClient.patch<BackendPendingTicket>(
		`v1/events/${validated.eventId}/tickets/${validated.ticketId}/application/approve`,
	);
	return transformPendingTicket(response);
}

export async function rejectTicketApplication(
	data: RejectTicketApplicationRequest,
): Promise<PendingTicket> {
	const validated = rejectTicketApplicationSchema.parse(data);
	const response = await restClient.patch<BackendPendingTicket>(
		`v1/events/${validated.eventId}/tickets/${validated.ticketId}/application/reject`,
		{ reason: validated.reason },
	);
	return transformPendingTicket(response);
}

export async function resendTicketRsvp(
	data: ResendTicketRsvpRequest,
): Promise<PendingTicket> {
	const validated = resendTicketRsvpSchema.parse(data);
	const response = await restClient.post<BackendPendingTicket>(
		`v1/events/${validated.eventId}/tickets/${validated.ticketId}/application/resend_rsvp`,
	);
	return transformPendingTicket(response);
}

export async function approveTicketRsvp(
	data: ApproveTicketRsvpRequest,
): Promise<PendingTicket> {
	const validated = approveTicketRsvpSchema.parse(data);
	const response = await restClient.patch<BackendPendingTicket>(
		`v1/events/${validated.eventId}/tickets/${validated.ticketId}/application/approve_rsvp`,
	);
	return transformPendingTicket(response);
}

export async function acceptWaitingList(
	data: AcceptWaitingListRequest,
): Promise<PendingTicket> {
	const validated = acceptWaitingListSchema.parse(data);
	const response = await restClient.patch<BackendPendingTicket>(
		`v1/events/${validated.eventId}/tickets/${validated.ticketId}/accept_waiting_list`,
	);
	return transformPendingTicket(response);
}
