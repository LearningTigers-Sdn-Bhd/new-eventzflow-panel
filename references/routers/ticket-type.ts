import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { protectedHttpClient } from "../lib/http-client";

// Backend ticket type response
interface BackendTicketType {
	id: number;
	event_id: number | null;
	name: string;
	price: string; // Decimal comes as string from Rails
	quantity: number;
	max_per_order: number;
	sale_starts_at: string | null;
	sale_ends_at: string | null;
	status: "draft" | "published" | "archived";
	hidden: boolean;
	custom_fields_data: Record<string, unknown>;
	created_at: string;
	updated_at: string;
}

// Frontend ticket type format
export interface TicketType {
	id: number;
	eventId: number | null;
	name: string;
	price: number;
	quantity: number;
	maxPerOrder: number;
	saleStartsAt: string | null;
	saleEndsAt: string | null;
	status: "draft" | "published" | "archived";
	hidden: boolean;
	customFieldsData: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
}

// Transform backend ticket type to frontend format
function transformTicketType(backendType: BackendTicketType): TicketType {
	return {
		id: backendType.id,
		eventId: backendType.event_id,
		name: backendType.name,
		price: Number.parseFloat(backendType.price),
		quantity: backendType.quantity,
		maxPerOrder: backendType.max_per_order,
		saleStartsAt: backendType.sale_starts_at,
		saleEndsAt: backendType.sale_ends_at,
		status: backendType.status,
		hidden: backendType.hidden,
		customFieldsData: backendType.custom_fields_data,
		createdAt: backendType.created_at,
		updatedAt: backendType.updated_at,
	};
}

export const ticketTypeRouter = router({
	// Get ticket types for a specific event
	getEventTicketTypes: protectedProcedure
		.input(z.object({ eventId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				const response = await protectedHttpClient.get<BackendTicketType[]>(
					`v1/events/${input.eventId}/ticket_types`,
					ctx.token,
				);

				return response.map(transformTicketType);
			} catch (error: any) {
				console.error("Error fetching event ticket types:", error);

				if (error.response?.status === 401) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Unauthorized to access ticket types",
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
					message: error.message || "Failed to fetch ticket types",
				});
			}
		}),

	// Get global ticket types (where event_id is null)
	// These are ticket type templates that can be used across events
	getGlobalTicketTypes: protectedProcedure.query(async ({ ctx }) => {
		try {
			const response = await protectedHttpClient.get<BackendTicketType[]>(
				"v1/ticket_types",
				ctx.token,
			);

			return response.map(transformTicketType);
		} catch (error: any) {
			console.error("Error fetching global ticket types:", error);

			if (error.response?.status === 401) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Unauthorized to access global ticket types",
				});
			}

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: error.message || "Failed to fetch global ticket types",
			});
		}
	}),

	// Get a single ticket type
	getTicketType: protectedProcedure
		.input(z.object({ eventId: z.string(), ticketTypeId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				const response = await protectedHttpClient.get<BackendTicketType>(
					`v1/events/${input.eventId}/ticket_types/${input.ticketTypeId}`,
					ctx.token,
				);

				return transformTicketType(response);
			} catch (error: any) {
				console.error("Error fetching ticket type:", error);

				if (error.response?.status === 404) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Ticket type not found",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to fetch ticket type",
				});
			}
		}),

	// Create ticket type
	createTicketType: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				name: z.string().min(1).max(100),
				price: z.number().min(0),
				quantity: z.number().int().min(0),
				max_per_order: z.number().int().min(1),
				sale_starts_at: z.string().optional(),
				sale_ends_at: z.string().optional(),
				status: z.enum(["draft", "published", "archived"]).optional(),
				hidden: z.boolean().optional(),
				custom_fields_data: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const { eventId, ...ticketTypeData } = input;

				const response = await protectedHttpClient.post<BackendTicketType>(
					`v1/events/${eventId}/ticket_types`,
					{ ticket_type: ticketTypeData },
					ctx.token,
				);

				return transformTicketType(response);
			} catch (error: any) {
				console.error("Error creating ticket type:", error);

				if (error.response?.status === 422) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: error.response.data?.message || "Validation error",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to create ticket type",
				});
			}
		}),

	// Update ticket type
	updateTicketType: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				ticketTypeId: z.string(),
				name: z.string().min(1).max(100).optional(),
				price: z.number().min(0).optional(),
				quantity: z.number().int().min(0).optional(),
				max_per_order: z.number().int().min(1).optional(),
				sale_starts_at: z.string().optional(),
				sale_ends_at: z.string().optional(),
				status: z.enum(["draft", "published", "archived"]).optional(),
				hidden: z.boolean().optional(),
				custom_fields_data: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const { eventId, ticketTypeId, ...updateData } = input;

				const response = await protectedHttpClient.put<BackendTicketType>(
					`v1/events/${eventId}/ticket_types/${ticketTypeId}`,
					{ ticket_type: updateData },
					ctx.token,
				);

				return transformTicketType(response);
			} catch (error: any) {
				console.error("Error updating ticket type:", error);

				if (error.response?.status === 422) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: error.response.data?.message || "Validation error",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to update ticket type",
				});
			}
		}),

	// Delete ticket type
	deleteTicketType: protectedProcedure
		.input(z.object({ eventId: z.string(), ticketTypeId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				await protectedHttpClient.delete(
					`v1/events/${input.eventId}/ticket_types/${input.ticketTypeId}`,
					ctx.token,
				);

				return { success: true };
			} catch (error: any) {
				console.error("Error deleting ticket type:", error);

				if (error.response?.status === 422) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message:
							error.response.data?.error ||
							"Cannot delete ticket type with existing tickets",
					});
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message || "Failed to delete ticket type",
				});
			}
		}),
});

