import { z } from "zod";

// Validation schema for creating a rentable item
export const createRentableItemSchema = z.object({
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
	description: z.string().max(1000, "Description is too long").optional(),
	unit_of_measure: z.string().min(1, "Unit of measure is required"),
	default_price: z.number().min(0, "Price must be 0 or greater"),
	status: z.enum(["active", "inactive"]).default("active"),
	item_category_id: z.number().min(1, "Category is required"),
	image: z.instanceof(File).optional(),
});

// Validation schema for updating a rentable item
export const updateRentableItemSchema = z.object({
	id: z.number().min(1, "Item ID is required"),
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
	description: z.string().max(1000, "Description is too long").optional(),
	unit_of_measure: z.string().min(1, "Unit of measure is required"),
	default_price: z.number().min(0, "Price must be 0 or greater"),
	status: z.enum(["active", "inactive"]),
	item_category_id: z.number().min(1, "Category is required"),
	image: z.instanceof(File).optional(),
	remove_image: z.boolean().optional(),
});

// Validation schema for deleting a rentable item
export const deleteRentableItemSchema = z.object({
	id: z.number().min(1, "Item ID is required"),
});

// Type exports for request data
export type CreateRentableItemRequest = z.infer<typeof createRentableItemSchema>;
export type UpdateRentableItemRequest = z.infer<typeof updateRentableItemSchema>;
export type DeleteRentableItemRequest = z.infer<typeof deleteRentableItemSchema>;
