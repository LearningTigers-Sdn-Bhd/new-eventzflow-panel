import { z } from "zod";

// Update profile request schema
export const updateProfileRequestSchema = z.object({
	user: z.object({
		full_name: z.string().optional(),
		phone: z.string().optional(),
		password: z.string().optional(),
		password_confirmation: z.string().optional(),
	}),
});

// Export TypeScript types derived from schemas
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

// Export individual field type for convenience
export type UpdateProfileRequestData = UpdateProfileRequest["user"];
