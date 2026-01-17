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

// Password reset: request reset email
export const requestResetPasswordSchema = z.object({
	email: emailSchema,
});

// Password reset: verify reset request token
export const verifyResetPasswordRequestSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

// Password reset: perform reset with token
export const resetPasswordSchema = z
	.object({
		token: z.string().min(1, "Token is required"),
		password: passwordSchema,
		password_confirmation: passwordSchema,
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Passwords do not match",
		path: ["password_confirmation"],
	});

// Update password (authenticated user)
export const updatePasswordRequestSchema = z
	.object({
		current_password: z.string().min(1, "Current password is required"),
		new_password: passwordSchema,
		confirm_new_password: passwordSchema,
	})
	.refine((data) => data.new_password === data.confirm_new_password, {
		message: "Passwords do not match",
		path: ["confirm_new_password"],
	});

// Export TypeScript types derived from schemas
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RequestResetPasswordRequest = z.infer<
	typeof requestResetPasswordSchema
>;
export type VerifyResetPasswordRequest = z.infer<
	typeof verifyResetPasswordRequestSchema
>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordRequest = z.infer<typeof updatePasswordRequestSchema>;

// Export individual field types for convenience
export type LoginRequestData = LoginRequest["user"];
export type RegisterRequestData = RegisterRequest["user"];
