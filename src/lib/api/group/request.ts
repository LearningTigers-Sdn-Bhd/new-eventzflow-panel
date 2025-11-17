import { z } from "zod";

// Zod schemas for form validation and request data
export const createGroupSchema = z.object({
	name: z.string().min(1, "Group name is required"),
	description: z.string().optional(),
	manager_id: z.number().optional(),
});

export const updateGroupSchema = z.object({
	name: z.string().min(1, "Group name is required").optional(),
	description: z.string().optional(),
});

// Export types for form data
export type CreateGroupRequest = z.infer<typeof createGroupSchema>;
export type UpdateGroupRequest = z.infer<typeof updateGroupSchema>;
