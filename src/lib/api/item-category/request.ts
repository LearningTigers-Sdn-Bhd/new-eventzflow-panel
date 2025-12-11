import { z } from "zod";

// Validation schema for creating an item category
export const createItemCategorySchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	active: z.boolean().default(true),
});

// Validation schema for updating an item category
export const updateItemCategorySchema = z.object({
	id: z.number().min(1, "Category ID is required"),
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	active: z.boolean(),
});

// Validation schema for deleting an item category
export const deleteItemCategorySchema = z.object({
	id: z.number().min(1, "Category ID is required"),
});

// Type exports for request data
export type CreateItemCategoryRequest = z.infer<typeof createItemCategorySchema>;
export type UpdateItemCategoryRequest = z.infer<typeof updateItemCategorySchema>;
export type DeleteItemCategoryRequest = z.infer<typeof deleteItemCategorySchema>;
