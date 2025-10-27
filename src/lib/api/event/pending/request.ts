import { z } from "zod";

// Validation schema for getting pending tickets
export const getPendingTicketsSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

// Validation schema for creating a pending ticket
export const createPendingTicketSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	attendee_name: z.string().min(1),
	attendee_email: z.string().email(),
	attendee_phone: z.string().optional(),
	ticket_type_id: z.number().int().positive(),
	payment_status: z.number().int().min(0).max(3).optional(), // 0=pending, 1=paid, 2=failed, 3=refunded_payment
	payment_screenshot_url: z.string().optional(),
	transaction_id: z.string().optional(),
	payment_method: z.string().optional(),
	custom_fields_data: z.record(z.string(), z.string()).optional(),
});

// Validation schema for updating a pending ticket
export const updatePendingTicketSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketId: z.string().min(1, "Ticket ID is required"),
	attendee_name: z.string().optional(),
	attendee_email: z.string().email().optional(),
	attendee_phone: z.string().optional(),
	ticket_type_id: z.number().optional(),
	payment_status: z.number().int().min(0).max(3).optional(), // 0=pending, 1=paid, 2=failed, 3=refunded_payment
	payment_screenshot_url: z.string().optional(),
	transaction_id: z.string().optional(),
	payment_method: z.string().optional(),
	custom_fields_data: z.record(z.string(), z.string()).optional(),
});

// Type exports for request data
export type GetPendingTicketsRequest = z.infer<typeof getPendingTicketsSchema>;
export type CreatePendingTicketRequest = z.infer<
	typeof createPendingTicketSchema
>;
export type UpdatePendingTicketRequest = z.infer<
	typeof updatePendingTicketSchema
>;
