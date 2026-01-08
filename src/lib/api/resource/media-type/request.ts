import { z } from "zod";

export const createResourceMediaTypeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
});

export const updateResourceMediaTypeSchema = z.object({
	id: z.string().min(1, "ID is required"),
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
});

export type CreateResourceMediaTypeRequest = z.infer<
	typeof createResourceMediaTypeSchema
>;
export type UpdateResourceMediaTypeRequest = z.infer<
	typeof updateResourceMediaTypeSchema
>;