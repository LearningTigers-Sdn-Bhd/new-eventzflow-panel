import { z } from "zod";

// Validation schema for linking a rentable item to an event
export const createEventRentableItemSchema = z.object({
	event_id: z.number().min(1, "Event ID is required"),
	rentable_item_id: z.number().min(1, "Rentable item ID is required"),
});

// Validation schema for unlinking a rentable item from an event
export const deleteEventRentableItemSchema = z.object({
	event_id: z.number().min(1, "Event ID is required"),
	id: z.number().min(1, "Event rentable item ID is required"),
});

// Type exports for request data
export type CreateEventRentableItemRequest = z.infer<
	typeof createEventRentableItemSchema
>;
export type DeleteEventRentableItemRequest = z.infer<
	typeof deleteEventRentableItemSchema
>;
