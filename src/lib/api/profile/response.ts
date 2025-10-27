import { z } from "zod";
import { type User, userSchema } from "@/lib/api/auth";

// Profile response schema
export const profileResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: userSchema,
});

// Export TypeScript types derived from schemas
export type ProfileResponse = z.infer<typeof profileResponseSchema>;

// Re-export User type from auth for convenience
export type { User };
