import { z } from "zod";

// URL regex pattern for validation
const urlPattern = /^https?:\/\/.+/;

// Exhibitor kit attributes schema for nested creation
// Only PIC fields are required, booth/company info is optional
const exhibitorKitAttributesSchema = z.object({
	// Optional booth info
	booth_number: z.string().optional(),
	booth_type: z.enum(["shell_scheme", "raw_space"]).optional(),
	booth_dimensions: z.string().optional(),
	side_wall_left_required: z.boolean().optional(),
	side_wall_right_required: z.boolean().optional(),
	name_on_fascia: z.string().max(25, "Name on fascia must be 25 characters or less").optional(),
	fascia_upgrade_required: z.boolean().optional(),
	// Optional company info
	company_name: z.string().optional(),
	company_address: z.string().optional(),
	// Required PIC info
	pic_full_name: z.string().min(1, "PIC full name is required"),
	pic_contact_number: z.string().min(1, "PIC contact number is required"),
	pic_email_address: z.string().email("Must be a valid email address").optional().or(z.literal("")),
	// Optional extras
	extra_crew_count: z.number().optional(),
	special_requirements: z.string().optional(),
	exhibitor_team_members_attributes: z.array(z.object({
		full_name: z.string().min(1, "Full name is required"),
	})).optional(),
});

// Zod schemas for form validation and request data
export const createEventVendorSchema = z.object({
	vendor_id: z.number(),
	redirect_url: z
		.string()
		.regex(urlPattern, "Must be a valid URL")
		.optional()
		.or(z.literal(""))
		.or(z.undefined()),
	poster_url: z
		.string()
		.regex(urlPattern, "Must be a valid URL")
		.optional()
		.or(z.literal(""))
		.or(z.undefined()),
	qr_url: z
		.string()
		.regex(urlPattern, "Must be a valid URL")
		.optional()
		.or(z.literal(""))
		.or(z.undefined()),
	exhibitor_owner_id: z.number().optional(), // Only for Exhibitor type (ticket events)
	exhibitor_kit_attributes: exhibitorKitAttributesSchema.optional(),
});

export type ExhibitorKitAttributes = z.infer<typeof exhibitorKitAttributesSchema>;

export const updateEventVendorSchema = z.object({
	redirect_url: z
		.string()
		.regex(urlPattern, "Must be a valid URL")
		.optional()
		.or(z.literal(""))
		.or(z.undefined()),
	poster_url: z
		.string()
		.regex(urlPattern, "Must be a valid URL")
		.optional()
		.or(z.literal(""))
		.or(z.undefined()),
	qr_url: z
		.string()
		.regex(urlPattern, "Must be a valid URL")
		.optional()
		.or(z.literal(""))
		.or(z.undefined()),
});

// Export types for form data
export type CreateEventVendorRequest = z.infer<typeof createEventVendorSchema>;
export type UpdateEventVendorRequest = z.infer<typeof updateEventVendorSchema>;
