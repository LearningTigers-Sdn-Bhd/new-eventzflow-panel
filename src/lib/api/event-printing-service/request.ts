import { z } from "zod";

// Validation schema for linking a printing service to an event
export const createEventPrintingServiceSchema = z.object({
	event_id: z.number().min(1, "Event ID is required"),
	printing_service_id: z.number().min(1, "Printing service ID is required"),
});

// Validation schema for unlinking a printing service from an event
export const deleteEventPrintingServiceSchema = z.object({
	event_id: z.number().min(1, "Event ID is required"),
	id: z.number().min(1, "Event printing service ID is required"),
});

// Type exports for request data
export type CreateEventPrintingServiceRequest = z.infer<
	typeof createEventPrintingServiceSchema
>;
export type DeleteEventPrintingServiceRequest = z.infer<
	typeof deleteEventPrintingServiceSchema
>;
