import { z } from "zod";

// Validation schema for getting pending tickets
export const getPendingTicketsSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

// Validation schema for creating a pending ticket
export const createPendingTicketSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	attendee_name: z.string().min(1),
	attendee_email: z
		.union([z.string().email(), z.literal(""), z.null(), z.undefined()])
		.optional(),
	attendee_phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
	ticket_type_id: z.number().int().positive(),
	role: z.string().optional(),
	payment_status: z.number().int().min(0).max(3).optional(), // 0=pending, 1=paid, 2=failed, 3=refunded_payment
	payment_screenshot_url: z.string().optional(),
	payment_proof: z.instanceof(File).optional(),
	transaction_id: z.string().optional(),
	payment_method: z.string().optional(),
	custom_fields_data: z.record(z.string(), z.string()).optional(),
	// Bulk-add N identical tickets under one registration batch. Only
	// meaningful (and only shown in the UI) when the event has
	// allow_multiple_tickets_per_email enabled — backend rejects >1 otherwise.
	quantity: z.number().int().min(1).max(50).optional(),
});

// Validation schema for updating a pending ticket
export const updatePendingTicketSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketId: z.string().min(1, "Ticket ID is required"),
	attendee_name: z.string().optional(),
	attendee_email: z
		.union([z.string().email(), z.literal(""), z.null(), z.undefined()])
		.optional(),
	attendee_phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
	ticket_type_id: z.number().optional(),
	role: z.string().optional(),
	payment_status: z.number().int().min(0).max(3).optional(), // 0=pending, 1=paid, 2=failed, 3=refunded_payment
	payment_screenshot_url: z.string().optional(),
	payment_proof: z.instanceof(File).optional(),
	transaction_id: z.string().optional(),
	payment_method: z.string().optional(),
	custom_fields_data: z.record(z.string(), z.string()).optional(),
});

export const approveTicketApplicationSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketId: z.string().min(1, "Ticket ID is required"),
});

export const rejectTicketApplicationSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketId: z.string().min(1, "Ticket ID is required"),
	reason: z.string().optional(),
});

export const revertTicketApplicationSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketId: z.string().min(1, "Ticket ID is required"),
	confirmManualRefund: z.boolean().optional(),
});

export const resendTicketRsvpSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketId: z.string().min(1, "Ticket ID is required"),
});

// Type exports for request data
export type GetPendingTicketsRequest = z.infer<typeof getPendingTicketsSchema>;
export type CreatePendingTicketRequest = z.infer<
	typeof createPendingTicketSchema
>;
export type UpdatePendingTicketRequest = z.infer<
	typeof updatePendingTicketSchema
>;
export type ApproveTicketApplicationRequest = z.infer<
	typeof approveTicketApplicationSchema
>;
export type RejectTicketApplicationRequest = z.infer<
	typeof rejectTicketApplicationSchema
>;
export type ResendTicketRsvpRequest = z.infer<typeof resendTicketRsvpSchema>;
export type RevertTicketApplicationRequest = z.infer<
	typeof revertTicketApplicationSchema
>;

export const approveTicketRsvpSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketId: z.string().min(1, "Ticket ID is required"),
});
export type ApproveTicketRsvpRequest = z.infer<typeof approveTicketRsvpSchema>;

export const acceptWaitingListSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketId: z.string().min(1, "Ticket ID is required"),
});
export type AcceptWaitingListRequest = z.infer<typeof acceptWaitingListSchema>;
