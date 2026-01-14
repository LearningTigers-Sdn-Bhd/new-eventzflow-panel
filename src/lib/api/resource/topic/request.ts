import { z } from "zod";

export const createResourceTopicSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	logo: z.string().optional(),
});

export const updateResourceTopicSchema = z.object({
	id: z.string().min(1, "ID is required"),
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	logo: z.string().optional(),
});

export type CreateResourceTopicRequest = z.infer<
	typeof createResourceTopicSchema
>;
export type UpdateResourceTopicRequest = z.infer<
	typeof updateResourceTopicSchema
>;
