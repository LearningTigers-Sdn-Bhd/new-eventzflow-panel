import { z } from "zod";

// Zod schemas for form validation and request data
export const checkInTicketSchema = z.object({
	publicId: z.string().min(1, "Ticket ID is required"),
});

export const createTicketSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	attendee_name: z.string().min(2, "Name must be at least 2 characters"),
	attendee_email: z.string().email("Please enter a valid email address"),
	attendee_phone: z.string().optional(),
	ticket_type_id: z.number().min(1, "Ticket type ID is required"),
	custom_fields_data: z.record(z.string()).optional(),
});

export const updateTicketSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	ticketId: z.string().min(1, "Ticket ID is required"),
	attendee_name: z.string().min(2, "Name must be at least 2 characters"),
	attendee_email: z.string().email("Please enter a valid email address"),
	attendee_phone: z.string().optional(),
	ticket_type_id: z.number().min(1, "Ticket type ID is required"),
	custom_fields_data: z.record(z.string()).optional(),
});

// Export types for form data
export type CheckInRequest = z.infer<typeof checkInTicketSchema>;
export type CreateTicketRequest = z.infer<typeof createTicketSchema>;
export type UpdateTicketRequest = z.infer<typeof updateTicketSchema>;
