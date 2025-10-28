import { z } from "zod";

// User schema
export const userSchema = z.object({
	id: z.number(),
	full_name: z.string().nullable().optional(),
	email: z.string().email(),
	role: z.enum(["org_owner", "manager", "member"]),
	phone: z.string().nullable().optional(),
	email_verified: z.boolean(),
});

// Auth response schema
export const authResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	data: z.object({
		access_token: z.string(),
		refresh_token: z.string(),
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
		refresh_token: z.string(),
		expires_at: z.string(),
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

// Export TypeScript types derived from schemas
export type User = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;
