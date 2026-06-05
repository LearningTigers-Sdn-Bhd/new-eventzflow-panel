import { z } from "zod";

export const createResourceSchema = z.object({
	title: z.string().min(1, "Title is required"),
	metaDescription: z.string().optional(),
	article: z.string().optional(), // HTML content
	status: z
		.enum(["draft", "pending_review", "published", "archived"])
		.optional(),

	topicId: z.string().or(z.number()),
	categoryId: z.string().or(z.number()),
	mediaTypeId: z.string().or(z.number()),
	isGated: z.boolean().default(false),
	isOfficial: z.boolean().default(false), // Admin/Official only, but good to have in schema
	priority: z.number().int().min(1).max(10).optional(),

	headerImg: z.any().optional(),
});

export const updateResourceSchema = z.object({
	id: z.string().min(1, "ID is required"),
	title: z.string().min(1).optional(),
	metaDescription: z.string().optional(),
	article: z.string().optional(),
	status: z
		.enum(["draft", "pending_review", "published", "archived", "rejected"])
		.optional(),

	topicId: z.string().or(z.number()).optional(),
	categoryId: z.string().or(z.number()).optional(),
	mediaTypeId: z.string().or(z.number()).optional(),
	isGated: z.boolean().optional(),
	priority: z.number().int().min(1).max(10).optional(),

	headerImg: z.any().optional(),
	removeHeaderImg: z.boolean().optional(),
});

export const approvalResourceSchema = z.object({
	id: z.string().min(1, "ID is required"),
	status: z.enum(["published", "rejected"]),
	rejection_reason: z.string().optional(),
});

export type CreateResourceRequest = z.infer<typeof createResourceSchema>;
export type UpdateResourceRequest = z.infer<typeof updateResourceSchema>;
export type ApprovalResourceRequest = z.infer<typeof approvalResourceSchema>;
