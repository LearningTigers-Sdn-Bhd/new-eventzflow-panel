import { z } from "zod";

// Validation schema for creating a price tier
export const createPriceTierSchema = z.object({
	ticketTypeId: z.number().min(1, "Ticket type ID is required"),
	label: z.string().min(1, "Label is required").max(255, "Label is too long"),
	price: z.number().min(0, "Price must be 0 or greater"),
	starts_at: z.string().min(1, "Start date is required"),
	ends_at: z.string().min(1, "End date is required"),
});

// Validation schema for updating a price tier
export const updatePriceTierSchema = z.object({
	ticketTypeId: z.number().min(1, "Ticket type ID is required"),
	id: z.number().min(1, "Price tier ID is required"),
	label: z.string().min(1, "Label is required").max(255, "Label is too long"),
	price: z.number().min(0, "Price must be 0 or greater"),
	starts_at: z.string().min(1, "Start date is required"),
	ends_at: z.string().min(1, "End date is required"),
});

// Validation schema for deleting a price tier
export const deletePriceTierSchema = z.object({
	ticketTypeId: z.number().min(1, "Ticket type ID is required"),
	id: z.number().min(1, "Price tier ID is required"),
});

// Type exports for request data
export type CreatePriceTierRequest = z.infer<typeof createPriceTierSchema>;
export type UpdatePriceTierRequest = z.infer<typeof updatePriceTierSchema>;
export type DeletePriceTierRequest = z.infer<typeof deletePriceTierSchema>;
