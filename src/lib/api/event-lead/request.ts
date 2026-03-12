import { z } from "zod";

// Zod schemas for form validation and request data
export const createLeadSchema = z.object({
	public_id: z.string().min(1),
	event_vendor_id: z.number(),
	notes: z.string().optional(),
});

export const updateLeadSchema = z.object({
	notes: z.string().optional(),
});

// Export types for form data
export type CreateLeadRequest = z.infer<typeof createLeadSchema>;
export type UpdateLeadRequest = z.infer<typeof updateLeadSchema>;
