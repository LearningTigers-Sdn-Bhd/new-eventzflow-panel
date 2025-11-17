import { z } from "zod";

// Zod schemas for form validation and request data
export const createVendorSchema = z.object({
	email: z.string().email("Must be a valid email"),
	full_name: z.string().min(2, "Full name must be at least 2 characters"),
	phone: z.string().optional(),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateVendorSchema = z.object({
	id: z.union([z.string(), z.number()]),
	email: z.string().email("Must be a valid email"),
	full_name: z.string().min(2, "Full name must be at least 2 characters"),
	phone: z.string().optional(),
	newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export const toggleVendorStatusSchema = z.object({
	id: z.union([z.string(), z.number()]),
	status: z.enum(["active", "inactive"]),
});

// Export types for form data
export type CreateVendorRequest = z.infer<typeof createVendorSchema>;
export type UpdateVendorRequest = z.infer<typeof updateVendorSchema>;
export type ToggleVendorStatusRequest = z.infer<typeof toggleVendorStatusSchema>;
