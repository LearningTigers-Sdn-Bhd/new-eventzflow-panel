import { z } from "zod";

// Zod schemas for form validation and request data
export const createEventSchema = z.object({
	title: z.string().min(3, "Event name must be at least 3 characters"),
	description: z.string().optional(),
	status: z
		.enum(["draft", "published", "cancelled", "completed"])
		.optional()
		.default("draft"),
	visibility: z.boolean().optional().default(true),
	use_ticket: z.boolean().optional().default(true),
	use_wedding: z.boolean().optional().default(false),
	extra_guest_limit: z.number().int().min(0).nullable().optional(),
	use_seat_ticketing: z.boolean().optional().default(false),
	use_exhibitor_kit: z.boolean().optional().default(false),
	allow_contractor_printing_services: z.boolean().optional().default(false),
	use_business_matching: z.boolean().optional().default(true),
	use_sponsorship: z.boolean().optional().default(false),
	// photo_booth_enabled: z.boolean().optional().default(false),
	use_event_leads: z.boolean().optional().default(false),
	start_date: z.string(), // ISO date string
	end_date: z.string(), // ISO date string
	multiple_scans: z.boolean().optional().default(false),
	webhook_url: z.string().url().optional().or(z.literal("")),
	business_matching_webhook_url: z.string().url().optional().or(z.literal("")),
	labels_data: z.record(z.string(), z.any()).optional(),
	event_admin_id: z.number().optional(),
});

export const updateEventSchema = z.object({
	title: z
		.string()
		.min(3, "Event name must be at least 3 characters")
		.optional(),
	description: z.string().optional(),
	status: z.enum(["draft", "published", "cancelled", "completed"]).optional(),
	visibility: z.boolean().optional(),
	use_ticket: z.boolean().optional(),
	use_wedding: z.boolean().optional(),
	extra_guest_limit: z.number().int().min(0).nullable().optional(),
	use_seat_ticketing: z.boolean().optional(),
	use_exhibitor_kit: z.boolean().optional(),
	allow_contractor_printing_services: z.boolean().optional(),
	use_business_matching: z.boolean().optional(),
	use_sponsorship: z.boolean().optional(),
	// photo_booth_enabled: z.boolean().optional(),
	use_event_leads: z.boolean().optional(),
	payment_receipt_email: z
		.string()
		.email()
		.optional()
		.or(z.literal(""))
		.or(z.null()),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	multiple_scans: z.boolean().optional(),
	webhook_url: z.string().url().optional().or(z.literal("")),
	business_matching_webhook_url: z.string().url().optional().or(z.literal("")),
	labels_data: z.record(z.string(), z.any()).optional(),
	booth_types: z.array(z.string()).optional(),
	event_email_setting_attributes: z
		.object({
			sender_name: z.string().optional().or(z.literal("")).or(z.null()),
			sender_address: z
				.string()
				.email()
				.optional()
				.or(z.literal(""))
				.or(z.null()),
			contact_email: z
				.string()
				.email()
				.optional()
				.or(z.literal(""))
				.or(z.null()),
			payment_receipt_email: z
				.string()
				.email()
				.optional()
				.or(z.literal(""))
				.or(z.null()),
		})
		.optional(),
});

// Export types for form data
export type CreateEventRequest = z.input<typeof createEventSchema>;
export type UpdateEventRequest = z.input<typeof updateEventSchema>;
