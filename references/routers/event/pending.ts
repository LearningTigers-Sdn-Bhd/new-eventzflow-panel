import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../../index";
import { protectedHttpClient } from "../../lib/http-client";
import type { PendingTicket } from "./type";

// Backend ticket response type (with payment fields)
interface BackendPendingTicket {
	id: number;
	public_id: string;
	attendee_name: string;
	attendee_email: string;
	attendee_phone?: string | null;
	ticket_type_id: number;
	event_id: number;
	status: "purchased" | "scanned" | "refunded" | "canceled";
	payment_status: "pending" | "paid" | "failed" | "refunded_payment" | number; // Can be string or number
	payment_screenshot_url?: string | null;
	transaction_id?: string | null;
	payment_method?: string | null;
	checked_in: boolean;
	check_in_at: string | null;
	custom_fields_data: Record<string, string> | null;
	created_at: string;
	updated_at: string;
	ticket_type?: {
		id: number;
		name: string;
		price: number;
	};
}

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
		paymentStatus = backendTicket.payment_status as PendingTicket["paymentStatus"];
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

export const pendingRouter = router({
	// Get all pending tickets for an event (payment_status = pending or approval_pending)
	getPendingTickets: protectedProcedure
		.input(z.object({ eventId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				// Fetch all tickets for the event
				const response = await protectedHttpClient.get<BackendPendingTicket[]>(
					`v1/events/${input.eventId}/tickets`,
					ctx.token,
				);

				// Filter tickets:
				// 1. Include all tickets where payment_status is NOT paid (0, 2, 3 or "pending", "failed", "refunded_payment")
				// 2. Include paid tickets (1 or "paid") ONLY if transaction_id is NOT NULL
				const pendingTickets = response.filter(
					(ticket) => {
						// Handle both number and string payment status
						if (typeof ticket.payment_status === "number") {
							// If paid (1), only include if transaction_id exists
							if (ticket.payment_status === 1) {
								return ticket.transaction_id != null && ticket.transaction_id !== "";
							}
							// Include pending (0), failed (2), refunded_payment (3)
							return ticket.payment_status === 0 || ticket.payment_status === 2 || ticket.payment_status === 3;
						}
						// Handle string payment status
						if (ticket.payment_status === "paid") {
							return ticket.transaction_id != null && ticket.transaction_id !== "";
						}
						return ticket.payment_status === "pending" || 
						       ticket.payment_status === "failed" ||
						       ticket.payment_status === "refunded_payment";
					}
				);

				return pendingTickets.map(transformPendingTicket);
			} catch (error: any) {
				console.error("Error fetching pending tickets:", error);

				if (error.response?.status === 401) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Unauthorized to access tickets",
					});
				}

				if (error.response?.status === 404) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Event not found",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to fetch pending tickets",
				});
			}
		}),

	// Create a pending ticket
	createPendingTicket: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				attendee_name: z.string().min(1),
				attendee_email: z.string().email(),
				attendee_phone: z.string().optional(),
				ticket_type_id: z.number().int().positive(),
				payment_status: z.number().int().min(0).max(3).optional(), // 0=pending, 1=paid, 2=failed, 3=refunded_payment
				payment_screenshot_url: z.string().optional(),
				transaction_id: z.string().optional(),
				payment_method: z.string().optional(),
				custom_fields_data: z.record(z.string(), z.string()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const { eventId, ...ticketData } = input;

				const response = await protectedHttpClient.post<BackendPendingTicket>(
					`v1/events/${eventId}/tickets`,
					{ ticket: ticketData },
					ctx.token,
				);

				return transformPendingTicket(response);
			} catch (error: any) {
				console.error("Error creating pending ticket:", error);

				if (error.response?.status === 422) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: error.response.data?.message || "Validation error",
					});
				}

				if (error.response?.status === 403) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Not authorized to create tickets for this event",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to create pending ticket",
				});
			}
		}),

	// Update a pending ticket
	updatePendingTicket: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				ticketId: z.string(),
				attendee_name: z.string().optional(),
				attendee_email: z.string().email().optional(),
				attendee_phone: z.string().optional(),
				ticket_type_id: z.number().optional(),
				payment_status: z.number().int().min(0).max(3).optional(), // 0=pending, 1=paid, 2=failed, 3=refunded_payment
				payment_screenshot_url: z.string().optional(),
				transaction_id: z.string().optional(),
				payment_method: z.string().optional(),
				custom_fields_data: z.record(z.string(), z.string()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const { eventId, ticketId, ...updateData } = input;

				const response = await protectedHttpClient.put<BackendPendingTicket>(
					`v1/events/${eventId}/tickets/${ticketId}`,
					{ ticket: updateData },
					ctx.token,
				);

				return transformPendingTicket(response);
			} catch (error: any) {
				console.error("Error updating pending ticket:", error);

				if (error.response?.status === 422) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: error.response.data?.message || "Validation error",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to update pending ticket",
				});
			}
		}),
});
