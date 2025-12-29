import { z } from "zod";

// Validation schema for unlinking a printing service from an event
export const deleteEventPrintingServiceSchema = z.object({
	event_id: z.number().min(1, "Event ID is required"),
	id: z.number().min(1, "Event printing service ID is required"),
});

// Type exports for request data
export type DeleteEventPrintingServiceRequest = z.infer<
	typeof deleteEventPrintingServiceSchema
>;
