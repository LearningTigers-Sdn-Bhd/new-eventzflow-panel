import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../../index";
import { protectedHttpClient } from "../../lib/http-client";
import type { BaseTicket } from "./type";

// Backend ticket response type
interface BackendTicket {
	id: number;
	public_id: string;
	attendee_name: string;
	attendee_email: string;
	attendee_phone?: string | null;
	ticket_type_id: number;
	event_id: number;
	status: "purchased" | "scanned" | "refunded" | "canceled";
	payment_status: "pending" | "paid" | "failed" | "refunded_payment" | number; // Can be string or number
	checked_in: boolean;
	check_in_at: string | null;
	scanned_by_id?: number | null; // ID of user who scanned the ticket
	custom_fields_data: Record<string, string> | null;
	created_at: string;
	updated_at: string;
	ticket_type?: {
		id: number;
		name: string;
		price: number;
	};
}

// Transform backend ticket to frontend format
function transformTicket(backendTicket: BackendTicket): BaseTicket {
	const customLabels: Array<{ name: string; value: string }> = [];
	
	// Transform custom_fields_data to customLabels array
	if (backendTicket.custom_fields_data) {
		for (const [key, value] of Object.entries(backendTicket.custom_fields_data)) {
			customLabels.push({ name: key, value: String(value) });
		}
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
		ticketTypeId: backendTicket.ticket_type_id,
		ticketTypeName: backendTicket.ticket_type?.name || "Unknown",
		checkedIn: backendTicket.checked_in,
		checkInAt: backendTicket.check_in_at,
	};
}

export const ticketRouter = router({
	// Get all tickets for an event (only paid tickets with payment_status = 1 or "paid")
	getTickets: protectedProcedure
		.input(z.object({ eventId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				const response = await protectedHttpClient.get<BackendTicket[]>(
					`v1/events/${input.eventId}/tickets`,
					ctx.token,
				);

				// Filter to only show paid tickets (payment_status = 1 or "paid")
				const paidTickets = response.filter((ticket) => {
					// Handle both number and string payment status
					if (typeof ticket.payment_status === "number") {
						return ticket.payment_status === 1; // 1 = paid
					}
					return ticket.payment_status === "paid";
				});

				return paidTickets.map(transformTicket);
			} catch (error: any) {
				console.error("Error fetching tickets:", error);
				
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
					message: error.message || "Failed to fetch tickets",
				});
			}
		}),

	// Get a single ticket
	getTicket: protectedProcedure
		.input(z.object({ eventId: z.string(), ticketId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				const response = await protectedHttpClient.get<BackendTicket>(
					`v1/events/${input.eventId}/tickets/${input.ticketId}`,
					ctx.token,
				);

				return transformTicket(response);
			} catch (error: any) {
				console.error("Error fetching ticket:", error);
				
				if (error.response?.status === 404) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Ticket not found",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to fetch ticket",
				});
			}
		}),

	// Update a ticket
	updateTicket: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				ticketId: z.string(),
				attendee_name: z.string().optional(),
				attendee_email: z.string().email().optional(),
				attendee_phone: z.string().optional(),
				ticket_type_id: z.number().optional(),
				custom_fields_data: z.record(z.string(), z.string()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const { eventId, ticketId, ...updateData } = input;

				const response = await protectedHttpClient.put<BackendTicket>(
					`v1/events/${eventId}/tickets/${ticketId}`,
					{ ticket: updateData },
					ctx.token,
				);

				return transformTicket(response);
			} catch (error: any) {
				console.error("Error updating ticket:", error);
				
				if (error.response?.status === 422) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: error.response.data?.message || "Validation error",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to update ticket",
				});
			}
		}),

	// Cancel a ticket (soft delete)
	cancelTicket: protectedProcedure
		.input(z.object({ eventId: z.string(), ticketId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				await protectedHttpClient.delete(
					`v1/events/${input.eventId}/tickets/${input.ticketId}`,
					ctx.token,
				);

				return { success: true };
			} catch (error: any) {
				console.error("Error canceling ticket:", error);
				
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to cancel ticket",
				});
			}
		}),

	// Check in a ticket
	checkInTicket: protectedProcedure
		.input(z.object({ publicId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const response = await protectedHttpClient.patch<BackendTicket>(
					`v1/tickets/${input.publicId}/check_in`,
					{},
					ctx.token,
				);

				return transformTicket(response);
			} catch (error: any) {
				console.error("Error checking in ticket:", error);
				
				if (error.response?.status === 422) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: error.response.data?.error || "Ticket already checked in",
					});
				}

				if (error.response?.status === 404) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Ticket not found",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to check in ticket",
				});
			}
		}),

	// Get all tickets scanned by current user (across all their events)
	getMyScannedTickets: protectedProcedure
		.input(z.object({ 
			limit: z.number().int().positive().max(1000).optional().default(1000),
		}))
		.query(async ({ ctx, input }) => {
			try {
				// First, get current user profile to get their ID
				const currentUser = await protectedHttpClient.get<{ id: number }>(
					"v1/users/profile",
					ctx.token,
				);

				const userId = currentUser.id;

				// Fetch all events the user has access to
				const events = await protectedHttpClient.get<Array<{ id: number; title: string }>>(
					"v1/events",
					ctx.token,
				);

				// Fetch tickets from all events in parallel
				const ticketPromises = events.map(async (event) => {
					try {
						const tickets = await protectedHttpClient.get<BackendTicket[]>(
							`v1/events/${event.id}/tickets`,
							ctx.token,
						);
						// Add event info to each ticket
						return tickets.map(ticket => ({
							...ticket,
							eventName: event.title,
							eventId: event.id,
						}));
					} catch (error) {
						return [];
					}
				});

				const allTicketsArrays = await Promise.all(ticketPromises);
				const allTickets = allTicketsArrays.flat();

				// Filter for tickets scanned by this user
				const scannedByUser = allTickets.filter(
					(ticket) => ticket.checked_in && ticket.scanned_by_id === userId
				);

				// Sort by check_in_at (newest first) and limit results
				const sortedTickets = scannedByUser
					.sort((a, b) => {
						const dateA = a.check_in_at ? new Date(a.check_in_at).getTime() : 0;
						const dateB = b.check_in_at ? new Date(b.check_in_at).getTime() : 0;
						return dateB - dateA;
					})
					.slice(0, input.limit);

				// Transform and return tickets with event info
				return sortedTickets.map(ticket => ({
					...transformTicket(ticket),
					eventName: ticket.eventName,
					eventId: ticket.eventId,
				}));
			} catch (error: any) {
				console.error("❌ Error fetching scanned tickets:", error);
				
				if (error.response?.status === 401) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Unauthorized to access tickets",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to fetch scanned tickets",
				});
			}
		}),

	/**
	 * Get all events and tickets for offline scanning
	 * Returns all tickets from all events the user has access to
	 */
	getAllForOffline: protectedProcedure
		.query(async ({ ctx }) => {
			try {
				// Fetch all events the user has access to
				const events = await protectedHttpClient.get<Array<{ id: number; title: string }>>(
					"v1/events",
					ctx.token,
				);

				// Fetch tickets from all events in parallel
				const ticketPromises = events.map(async (event) => {
					try {
						const tickets = await protectedHttpClient.get<BackendTicket[]>(
							`v1/events/${event.id}/tickets`,
							ctx.token,
						);
						// Add event info to each ticket
						return tickets.map(ticket => ({
							...transformTicket(ticket),
							eventId: event.id,
							eventName: event.title,
						}));
					} catch (error) {
						// Silently ignore events without tickets or access errors
						return [];
					}
				});

				const allTicketsArrays = await Promise.all(ticketPromises);
				const allTickets = allTicketsArrays.flat();

				return {
					events: events.map(e => ({ id: e.id, title: e.title })),
					tickets: allTickets,
				};
			} catch (error: any) {
				console.error("❌ Error fetching offline data:", error);
				
				if (error.response?.status === 401) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Unauthorized to access data",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to fetch offline data",
				});
			}
		}),

	// Create a ticket (without user_id as for now no need to implement choose user)
	createTicket: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				attendee_name: z.string().min(1),
				attendee_email: z.string().email(),
				attendee_phone: z.string().optional(),
				ticket_type_id: z.number().int().positive(),
				payment_status: z.number().int().min(0).max(3).optional(), // 0=pending, 1=paid, 2=failed, 3=refunded_payment
				custom_fields_data: z.record(z.string(), z.string()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const { eventId, ...ticketData } = input;

				const response = await protectedHttpClient.post<BackendTicket>(
					`v1/events/${eventId}/tickets`,
					{ ticket: ticketData },
					ctx.token,
				);

				return transformTicket(response);
			} catch (error: any) {
				console.error("Error creating ticket:", error);
				
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
					message: error.message || "Failed to create ticket",
				});
			}
		}),
});
