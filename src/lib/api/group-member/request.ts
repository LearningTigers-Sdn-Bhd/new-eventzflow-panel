import { z } from "zod";

// Zod schemas for form validation and request data
export const addMemberSchema = z.object({
	user_id: z.number(),
	has_manager_access: z.boolean().optional().default(false),
});

export const updateMemberSchema = z.object({
	has_manager_access: z.boolean(),
});

// Export types for form data
export type AddMemberRequest = z.infer<typeof addMemberSchema>;
export type UpdateMemberRequest = z.infer<typeof updateMemberSchema>;
