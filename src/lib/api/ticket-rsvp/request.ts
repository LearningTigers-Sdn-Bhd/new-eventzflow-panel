import { z } from "zod";

export const ticketRsvpRequestSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	token: z.string().min(1, "RSVP token is required"),
});

export type TicketRsvpRequest = z.infer<typeof ticketRsvpRequestSchema>;
