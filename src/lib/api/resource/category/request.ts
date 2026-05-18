import { z } from "zod";

export const createResourceCategorySchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
});

export const updateResourceCategorySchema = z.object({
	id: z.string().min(1, "ID is required"),
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
});

export type CreateResourceCategoryRequest = z.infer<
	typeof createResourceCategorySchema
>;
export type UpdateResourceCategoryRequest = z.infer<
	typeof updateResourceCategorySchema
>;
