import { z } from "zod";

// Zod schemas for form validation and request data
export const createAffiliateSchema = z.object({
	vendor_id: z.number(),
});

// Export types for form data
export type CreateAffiliateRequest = z.infer<typeof createAffiliateSchema>;
