import { z } from "zod";

// Validation schema for creating a price tier
export const createPrintingServicePriceTierSchema = z.object({
	event_printing_service_id: z
		.number()
		.min(1, "Event printing service ID is required"),
	price: z.number().min(0, "Price must be 0 or greater"),
	start_date: z.string().min(1, "Start date is required"),
	end_date: z.string().optional(),
	label: z.string().min(1, "Label is required").max(255, "Label is too long"),
});

// Validation schema for updating a price tier
export const updatePrintingServicePriceTierSchema = z.object({
	event_printing_service_id: z
		.number()
		.min(1, "Event printing service ID is required"),
	id: z.number().min(1, "Price tier ID is required"),
	price: z.number().min(0, "Price must be 0 or greater"),
	start_date: z.string().min(1, "Start date is required"),
	end_date: z.string().optional(),
	label: z.string().min(1, "Label is required").max(255, "Label is too long"),
});

// Validation schema for deleting a price tier
export const deletePrintingServicePriceTierSchema = z.object({
	event_printing_service_id: z
		.number()
		.min(1, "Event printing service ID is required"),
	id: z.number().min(1, "Price tier ID is required"),
});

// Type exports for request data
export type CreatePrintingServicePriceTierRequest = z.infer<
	typeof createPrintingServicePriceTierSchema
>;
export type UpdatePrintingServicePriceTierRequest = z.infer<
	typeof updatePrintingServicePriceTierSchema
>;
export type DeletePrintingServicePriceTierRequest = z.infer<
	typeof deletePrintingServicePriceTierSchema
>;
