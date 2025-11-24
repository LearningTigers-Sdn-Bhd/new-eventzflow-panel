import { z } from "zod";

// Zod schemas for form validation and request data
export const updateVendorProfileSchema = z.object({
	image: z.any().optional(),
	image_path: z.string().optional(),
	description: z.string().optional(),
	category: z.string().optional(),
	person_in_charge: z.string().optional(),
	address: z.string().optional(),
	notes: z.string().optional(),
});

// Export types for form data
export type UpdateVendorProfileRequest = z.infer<
	typeof updateVendorProfileSchema
>;
