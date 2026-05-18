import { z } from "zod";

// Validation schema for creating a printing service
export const createPrintingServiceSchema = z.object({
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
	description: z.string().max(1000, "Description is too long").optional(),
	unit_of_measure: z.string().min(1, "Unit of measure is required"),
	default_price: z.number().min(0, "Price must be 0 or greater"),
	status: z.enum(["active", "inactive"]).default("active"),
	item_category_id: z.number().min(1, "Category is required"),
	image: z.instanceof(File).optional(),
});

// Validation schema for updating a printing service
export const updatePrintingServiceSchema = z.object({
	id: z.number().min(1, "Service ID is required"),
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
	description: z.string().max(1000, "Description is too long").optional(),
	unit_of_measure: z.string().min(1, "Unit of measure is required"),
	default_price: z.number().min(0, "Price must be 0 or greater"),
	status: z.enum(["active", "inactive"]),
	item_category_id: z.number().min(1, "Category is required"),
	image: z.instanceof(File).optional(),
	remove_image: z.boolean().optional(),
});

// Validation schema for deleting a printing service
export const deletePrintingServiceSchema = z.object({
	id: z.number().min(1, "Service ID is required"),
});

// Type exports for request data
export type CreatePrintingServiceRequest = z.infer<
	typeof createPrintingServiceSchema
>;
export type UpdatePrintingServiceRequest = z.infer<
	typeof updatePrintingServiceSchema
>;
export type DeletePrintingServiceRequest = z.infer<
	typeof deletePrintingServiceSchema
>;
