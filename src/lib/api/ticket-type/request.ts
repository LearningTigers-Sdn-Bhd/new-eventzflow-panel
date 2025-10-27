import { z } from "zod";

// Validation schema for getting event ticket types
export const getEventTicketTypesSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

// Validation schema for getting a single ticket type
export const getTicketTypeSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketTypeId: z.string().min(1, "Ticket Type ID is required"),
});

// Validation schema for creating a ticket type
export const createTicketTypeSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	name: z.string().min(1).max(100),
	price: z.number().min(0),
	quantity: z.number().int().min(0),
	max_per_order: z.number().int().min(1),
	sale_starts_at: z.string().optional(),
	sale_ends_at: z.string().optional(),
	status: z.enum(["draft", "published", "archived"]).optional(),
	hidden: z.boolean().optional(),
	custom_fields_data: z.record(z.string(), z.unknown()).optional(),
});

// Validation schema for updating a ticket type
export const updateTicketTypeSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketTypeId: z.string().min(1, "Ticket Type ID is required"),
	name: z.string().min(1).max(100).optional(),
	price: z.number().min(0).optional(),
	quantity: z.number().int().min(0).optional(),
	max_per_order: z.number().int().min(1).optional(),
	sale_starts_at: z.string().optional(),
	sale_ends_at: z.string().optional(),
	status: z.enum(["draft", "published", "archived"]).optional(),
	hidden: z.boolean().optional(),
	custom_fields_data: z.record(z.string(), z.unknown()).optional(),
});

// Validation schema for deleting a ticket type
export const deleteTicketTypeSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketTypeId: z.string().min(1, "Ticket Type ID is required"),
});

// Type exports for request data
export type GetEventTicketTypesRequest = z.infer<
	typeof getEventTicketTypesSchema
>;
export type GetTicketTypeRequest = z.infer<typeof getTicketTypeSchema>;
export type CreateTicketTypeRequest = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeRequest = z.infer<typeof updateTicketTypeSchema>;
export type DeleteTicketTypeRequest = z.infer<typeof deleteTicketTypeSchema>;
