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
	type RejectTicketApplicationRequest,
	type ResendTicketRsvpRequest,
	type RevertTicketApplicationRequest,
	rejectTicketApplicationSchema,
	resendTicketRsvpSchema,
	revertTicketApplicationSchema,
	type UpdatePendingTicketRequest,
	updatePendingTicketSchema,
} from "./request";
import type {
	BackendPendingTicket,
	CreatePendingTicketResponse,
	PagedPendingTicketsResult,
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

// Non-paid payment states shown on the Pending Tickets tab. Sent as the
// default payment_status[] filter (tickets#index supports an array for an
// IN clause) so only this slice of the event's tickets ever comes over the
// wire, instead of every ticket (paid included) followed by an in-memory
// filter — the same class of unbounded fetch that used to make Manage
// Tickets slow on large events.
const PENDING_PAYMENT_STATUSES = ["pending", "failed", "refunded_payment"];

export interface GetPendingTicketsPagedOptions {
	page: number;
	perPage: number;
	q?: string;
	/** Narrows to one of PENDING_PAYMENT_STATUSES; omitted = all three. */
	paymentStatus?: "pending" | "failed" | "refunded_payment";
	reviewStatus?: "pending_review" | "approved" | "rejected";
	rsvpStatus?: "not_sent" | "sent" | "confirmed" | "declined" | "expired";
	ticketTypeName?: string;
	sortBy?: "name" | "email" | "status" | "createdAt";
	sortDir?: "asc" | "desc";
}

/**
 * One server-paginated page of pending tickets (payment_status = pending,
 * failed, or refunded_payment) for the Pending Tickets table. Search,
 * status/review/rsvp/type filtering, sorting, and paging all happen
 * server-side — see PagedPendingTicketsResult and tickets_controller.rb#index.
 */
export async function getPendingTicketsPaged(
	eventId: string,
	options: GetPendingTicketsPagedOptions,
): Promise<PagedPendingTicketsResult> {
	const params = new URLSearchParams();
	params.set("page", String(options.page));
	params.set("per_page", String(options.perPage));
	for (const status of options.paymentStatus
		? [options.paymentStatus]
		: PENDING_PAYMENT_STATUSES) {
		params.append("payment_status[]", status);
	}
	if (options.q) params.set("q", options.q);
	if (options.reviewStatus) params.set("review_status", options.reviewStatus);
	if (options.rsvpStatus) params.set("rsvp_status", options.rsvpStatus);
	if (options.ticketTypeName)
		params.set("ticket_type_name", options.ticketTypeName);
	if (options.sortBy) params.set("sort_by", options.sortBy);
	if (options.sortDir) params.set("sort_dir", options.sortDir);

	const { data: response, headers } = await restClient.getWithHeaders<
		BackendPendingTicket[]
	>(`v1/events/${eventId}/tickets?${params.toString()}`);

	return {
		data: response.map(transformPendingTicket),
		pagination: {
			currentPage: Number(headers.get("X-Page")) || options.page,
			totalPages: Number(headers.get("X-Total-Pages")) || 0,
			totalCount: Number(headers.get("X-Total-Count")) || 0,
			perPage: Number(headers.get("X-Per-Page")) || options.perPage,
		},
	};
}

// Builds multipart/form-data for the `ticket[...]` params, needed only when
// payment_proof is a real File (can't ride along in a JSON body).
function buildTicketFormData(
	ticketData: Record<string, unknown>,
	extra?: Record<string, unknown>,
): FormData {
	const formData = new FormData();
	for (const [key, value] of Object.entries(ticketData)) {
		if (value === undefined || value === null) continue;
		if (value instanceof File) {
			formData.append(`ticket[${key}]`, value);
		} else if (key === "custom_fields_data" && typeof value === "object") {
			for (const [fieldKey, fieldValue] of Object.entries(
				value as Record<string, string>,
			)) {
				formData.append(`ticket[custom_fields_data][${fieldKey}]`, fieldValue);
			}
		} else {
			formData.append(`ticket[${key}]`, String(value));
		}
	}
	for (const [key, value] of Object.entries(extra ?? {})) {
		if (value !== undefined && value !== null) {
			formData.append(key, String(value));
		}
	}
	return formData;
}

/**
 * Create a pending ticket
 */
export async function createPendingTicket(
	data: CreatePendingTicketRequest,
): Promise<CreatePendingTicketResponse> {
	try {
		const validated = createPendingTicketSchema.parse(data);
		const { eventId, quantity, ...ticketData } = validated;

		const response = ticketData.payment_proof
			? await restClient.postFormData<BackendPendingTicket>(
					`v1/events/${eventId}/tickets`,
					buildTicketFormData(ticketData, { quantity }),
				)
			: await restClient.post<BackendPendingTicket>(
					`v1/events/${eventId}/tickets`,
					{ ticket: ticketData, quantity },
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

		const response = updateData.payment_proof
			? await restClient.putFormData<BackendPendingTicket>(
					`v1/events/${eventId}/tickets/${ticketId}`,
					buildTicketFormData(updateData),
				)
			: await restClient.put<BackendPendingTicket>(
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

export async function revertTicketApplication(
	data: RevertTicketApplicationRequest,
): Promise<PendingTicket> {
	const validated = revertTicketApplicationSchema.parse(data);
	const response = await restClient.patch<BackendPendingTicket>(
		`v1/events/${validated.eventId}/tickets/${validated.ticketId}/application/revert`,
		{ confirm_manual_refund: validated.confirmManualRefund ?? false },
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
