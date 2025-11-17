import { z } from "zod";

// Zod schemas for form validation and request data
export const updateVendorProfileSchema = z.object({
	image_path: z.string().optional(),
	vendor_name: z.string().min(1, "Vendor name is required"),
	vendor_description: z.string().optional(),
});

// Export types for form data
export type UpdateVendorProfileRequest = z.infer<
	typeof updateVendorProfileSchema
>;
