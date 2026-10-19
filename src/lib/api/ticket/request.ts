import { z } from "zod";

// Zod schemas for form validation and request data
export const checkInTicketSchema = z.object({
	publicId: z.string().min(1, "Ticket ID is required"),
});

export const createTicketSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	attendee_name: z.string().min(2, "Name must be at least 2 characters"),
	attendee_email: z
		.union([
			z.string().email("Please enter a valid email address"),
			z.literal(""),
			z.null(),
			z.undefined(),
		])
		.optional(),
	attendee_phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
	ticket_type_id: z.number().min(1, "Ticket type ID is required"),
	role: z.string().optional(),
	custom_fields_data: z.record(z.string(), z.string()).optional(),
	payment_status: z.number().optional(),
	// Bulk-add N identical tickets under one registration batch. Only
	// meaningful (and only shown in the UI) when the event has
	// allow_multiple_tickets_per_email enabled — backend rejects >1 otherwise.
	quantity: z.number().int().min(1).max(50).optional(),
});

export const updateTicketSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketId: z.string().min(1, "Ticket ID is required"),
	attendee_name: z.string().min(2, "Name must be at least 2 characters"),
	attendee_email: z
		.union([
			z.string().email("Please enter a valid email address"),
			z.literal(""),
			z.null(),
			z.undefined(),
		])
		.optional(),
	attendee_phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
	ticket_type_id: z.number().min(1, "Ticket type ID is required"),
	role: z.string().optional(),
	payment_status: z.number().int().min(0).max(3).optional(), // 0=pending, 1=paid, 2=failed, 3=refunded_payment
	custom_fields_data: z.record(z.string(), z.string()).optional(),
	vehicle_registration_form_id: z.number().int().optional(),
});

// Export types for form data
export type CheckInRequest = z.infer<typeof checkInTicketSchema>;
export type CreateTicketRequest = z.infer<typeof createTicketSchema>;
export type UpdateTicketRequest = z.infer<typeof updateTicketSchema>;

// Sponsor guest passes: N placeholder tickets named "<label> Pax i/N" for
// guests whose real names aren't known yet. Backend auto-numbers the names,
// marks all passes paid/purchased, and groups them under one registration
// batch. Renaming a pass later is optional, never required.
export const createGuestPassesSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	label: z.string().min(2, "Label must be at least 2 characters"),
	// Hard ceiling against typos; ticket-type capacity is the real limit. The
	// dialog asks for confirmation above 50 before calling the API.
	quantity: z.number().int().min(1).max(500),
	ticket_type_id: z.number().min(1, "Ticket type ID is required"),
	attendee_email: z
		.union([
			z.string().email("Please enter a valid email address"),
			z.literal(""),
			z.null(),
			z.undefined(),
		])
		.optional(),
	attendee_phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
	role: z.string().optional(),
});

export type CreateGuestPassesRequest = z.infer<typeof createGuestPassesSchema>;
