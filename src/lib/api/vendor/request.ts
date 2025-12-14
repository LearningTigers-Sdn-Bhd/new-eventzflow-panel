import { z } from "zod";

export const vendorProfileAttributesSchema = z.object({
	id: z.number().optional(), // Required for updates to prevent destroy/recreate
	image: z.any().optional(),
	remove_image: z.boolean().optional(),
	description: z.string().optional(),
	category: z.string().optional(),
	person_in_charge: z.string().optional(),
	address: z.string().optional(),
	notes: z.string().optional(),
});

// Zod schemas for form validation and request data
export const createVendorSchema = z.object({
	email: z.string().email("Must be a valid email"),
	full_name: z.string().min(2, "Full name must be at least 2 characters"),
	phone: z.string().optional(),
	password: z.string().min(8, "Password must be at least 8 characters"),
	vendor_profile_attributes: vendorProfileAttributesSchema.optional(),
});

export const updateVendorSchema = z.object({
	id: z.union([z.string(), z.number()]),
	email: z.string().email("Must be a valid email"),
	full_name: z.string().min(2, "Full name must be at least 2 characters"),
	phone: z.string().optional(),
	newPassword: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.optional(),
	vendor_profile_attributes: vendorProfileAttributesSchema.optional(),
});

export const toggleVendorStatusSchema = z.object({
	id: z.union([z.string(), z.number()]),
	status: z.enum(["active", "inactive"]),
});

export const deleteVendorSchema = z.object({
	id: z.union([z.string(), z.number()]),
});

// Export types for form data
export type CreateVendorRequest = z.infer<typeof createVendorSchema>;
export type UpdateVendorRequest = z.infer<typeof updateVendorSchema>;
export type ToggleVendorStatusRequest = z.infer<
	typeof toggleVendorStatusSchema
>;
export type DeleteVendorRequest = z.infer<typeof deleteVendorSchema>;
