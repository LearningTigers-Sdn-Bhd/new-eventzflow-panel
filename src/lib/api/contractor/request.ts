import { z } from "zod";

// Zod schemas for form validation and request data

// Schema for creating a new exhibition contractor (user + profile)
export const createContractorSchema = z
	.object({
		full_name: z.string().min(1, "Full name is required"),
		email: z.string().email("Must be a valid email address"),
		phone: z.string().optional(),
		password: z.string().min(6, "Password must be at least 6 characters"),
		password_confirmation: z
			.string()
			.min(1, "Password confirmation is required"),
		created_by_id: z.number().optional(),
		exhibition_contractor_profile_attributes: z.object({
			company_name: z.string().optional(),
			contact_person: z.string().optional(),
			contact_email: z
				.string()
				.email("Must be a valid email address")
				.optional()
				.or(z.literal("")),
			contact_phone: z.string().optional(),
			allow_printing_services: z.boolean().optional(),
			standard_package_info: z.string().optional(),
		}),
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Passwords don't match",
		path: ["password_confirmation"],
	});

// Schema for updating an exhibition contractor
export const updateContractorSchema = z.object({
	full_name: z.string().min(1, "Full name is required").optional(),
	email: z.string().email("Must be a valid email address").optional(),
	phone: z.string().optional(),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.optional(),
	password_confirmation: z.string().optional(),
	created_by_id: z.number().optional(),
	exhibition_contractor_profile_attributes: z
		.object({
			company_name: z.string().optional(),
			contact_person: z.string().optional(),
			contact_email: z
				.string()
				.email("Must be a valid email address")
				.optional()
				.or(z.literal("")),
			contact_phone: z.string().optional(),
			allow_printing_services: z.boolean().optional(),
			standard_package_info: z.string().optional(),
		})
		.optional(),
});

// Schema for toggling contractor status
export const toggleStatusSchema = z.object({
	status: z.enum(["active", "inactive"]),
});

// Export types for form data
export type CreateContractorRequest = z.infer<typeof createContractorSchema>;
export type UpdateContractorRequest = z.infer<typeof updateContractorSchema>;
export type ToggleStatusRequest = z.infer<typeof toggleStatusSchema>;
