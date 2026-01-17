import { z } from "zod";

// User schema
export const userSchema = z.object({
	id: z.number(),
	full_name: z.string().nullable().optional(),
	email: z.string().email(),
	role: z.enum([
		"org_owner",
		"organizer",
		"member",
		"vendor",
		"exhibitor",
		"exhibition_contractor",
	]),
	phone: z.string().nullable().optional(),
	email_verified: z.boolean(),
});

// Auth response schema
export const authResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z.object({
		access_token: z.string(),
		expires_at: z.string(),
		user: userSchema,
	}),
});

// Refresh token response schema
export const refreshTokenResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z.object({
		access_token: z.string(),
		expires_at: z.string(),
		user: userSchema,
	}),
});

// Verify email response schema
export const verifyEmailResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z.object({
		user: userSchema,
	}),
});

// Password reset: request email response (backend may just return message)
export const requestResetPasswordResponseSchema = z.object({
	success: z.boolean().optional().default(true),
	message: z.string().optional().default("Password reset email sent"),
});

// Password reset: reset result response (message oriented)
export const resetPasswordResponseSchema = z.object({
	success: z.boolean().optional().default(true),
	message: z.string().optional().default("Password has been reset"),
});

// Update password response (returns fresh tokens)
export const updatePasswordResponseSchema = z.object({
	success: z.boolean().optional().default(true),
	message: z.string().optional().default("Password updated successfully"),
	data: z.object({
		access_token: z.string(),
		expires_at: z.string(),
	}),
});

// Export TypeScript types derived from schemas
export type User = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;
export type RequestResetPasswordResponse = z.infer<
	typeof requestResetPasswordResponseSchema
>;
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;
export type UpdatePasswordResponse = z.infer<
	typeof updatePasswordResponseSchema
>;
