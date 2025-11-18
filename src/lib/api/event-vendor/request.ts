import { z } from "zod";

// URL regex pattern for validation
const urlPattern = /^https?:\/\/.+/;

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
});

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
