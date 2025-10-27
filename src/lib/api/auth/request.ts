import { z } from "zod";

// Field-level validators for reuse in forms
export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters");
export const phoneSchema = z
	.string()
	.min(10, "Phone number must be at least 10 digits");
export const nameSchema = z
	.string()
	.min(2, "Name must be at least 2 characters");

// Login request schema
export const loginRequestSchema = z.object({
	user: z.object({
		email: emailSchema,
		password: passwordSchema,
	}),
});

// Register request schema
export const registerRequestSchema = z.object({
	user: z
		.object({
			email: emailSchema,
			password: passwordSchema,
			password_confirmation: passwordSchema,
			full_name: nameSchema,
			phone: phoneSchema,
		})
		.refine((data) => data.password === data.password_confirmation, {
			message: "Passwords do not match",
			path: ["password_confirmation"],
		}),
});

// Refresh token request schema
export const refreshTokenRequestSchema = z.object({
	refresh_token: z.string().min(1, "Refresh token is required"),
});

// Export TypeScript types derived from schemas
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;

// Export individual field types for convenience
export type LoginRequestData = LoginRequest["user"];
export type RegisterRequestData = RegisterRequest["user"];
