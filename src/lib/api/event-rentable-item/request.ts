import { z } from "zod";

// Validation schema for unlinking a rentable item from an event
export const deleteEventRentableItemSchema = z.object({
	event_id: z.number().min(1, "Event ID is required"),
	id: z.number().min(1, "Event rentable item ID is required"),
});

// Type exports for request data
export type DeleteEventRentableItemRequest = z.infer<
	typeof deleteEventRentableItemSchema
>;
