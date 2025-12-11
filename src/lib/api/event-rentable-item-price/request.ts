import { z } from "zod";

// Validation schema for creating a price tier
export const createPriceTierSchema = z.object({
	event_rentable_item_id: z
		.number()
		.min(1, "Event rentable item ID is required"),
	price: z.number().min(0, "Price must be 0 or greater"),
	start_date: z.string().min(1, "Start date is required"),
	end_date: z.string().optional(),
	label: z.string().min(1, "Label is required").max(255, "Label is too long"),
});

// Validation schema for updating a price tier
export const updatePriceTierSchema = z.object({
	event_rentable_item_id: z
		.number()
		.min(1, "Event rentable item ID is required"),
	id: z.number().min(1, "Price tier ID is required"),
	price: z.number().min(0, "Price must be 0 or greater"),
	start_date: z.string().min(1, "Start date is required"),
	end_date: z.string().optional(),
	label: z.string().min(1, "Label is required").max(255, "Label is too long"),
});

// Validation schema for deleting a price tier
export const deletePriceTierSchema = z.object({
	event_rentable_item_id: z
		.number()
		.min(1, "Event rentable item ID is required"),
	id: z.number().min(1, "Price tier ID is required"),
});

// Type exports for request data
export type CreatePriceTierRequest = z.infer<typeof createPriceTierSchema>;
export type UpdatePriceTierRequest = z.infer<typeof updatePriceTierSchema>;
export type DeletePriceTierRequest = z.infer<typeof deletePriceTierSchema>;
