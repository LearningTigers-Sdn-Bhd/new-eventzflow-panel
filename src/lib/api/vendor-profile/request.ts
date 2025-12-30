import { z } from "zod";

// Zod schemas for form validation and request data
export const updateVendorProfileSchema = z.object({
	image: z.any().optional(),
	remove_image: z.boolean().optional(),
	description: z.string().optional(),
	category: z.string().optional(),
	person_in_charge: z.string().optional(),
	address: z.string().optional(),
	notes: z.string().optional(),
	company_profile: z.string().optional(),
});

// Export types for form data
export type UpdateVendorProfileRequest = z.infer<
	typeof updateVendorProfileSchema
>;
