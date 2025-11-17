import { z } from "zod";

// Zod schemas for form validation and request data
export const createVisitorSchema = z.object({
	full_name: z.string().min(1, "Full name is required"),
	email: z.string().email("Must be a valid email").or(z.literal("")).optional(),
	phone: z.string().optional(),
	gender: z.string().optional(),
	age: z.number().optional(),
});

export const updateVisitorSchema = z.object({
	full_name: z.string().min(1, "Full name is required").optional(),
	email: z.string().email("Must be a valid email").optional(),
	phone: z.string().optional(),
	gender: z.string().optional(),
	age: z.number().optional(),
});

// Export types for form data
export type CreateVisitorRequest = z.infer<typeof createVisitorSchema>;
export type UpdateVisitorRequest = z.infer<typeof updateVisitorSchema>;
