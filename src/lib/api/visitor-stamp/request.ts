import { z } from "zod";

// Zod schemas for form validation and request data
export const createStampSchema = z.object({
	event_vendor_id: z.number(),
});

// Export types for form data
export type CreateStampRequest = z.infer<typeof createStampSchema>;
