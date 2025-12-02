import { z } from "zod";

// Zod schemas for form validation and request data
export const createEventSchema = z.object({
	title: z.string().min(3, "Event name must be at least 3 characters"),
	description: z.string().optional(),
	status: z
		.enum(["draft", "published", "cancelled"])
		.optional()
		.default("draft"),
	visibility: z.boolean().optional().default(true),
	use_ticket: z.boolean().optional().default(true),
	use_exhibitor_kit: z.boolean().optional().default(false),
	start_date: z.string(), // ISO date string
	end_date: z.string(), // ISO date string
	multiple_scans: z.boolean().optional().default(false),
	webhook_url: z.string().url().optional().or(z.literal("")),
	labels_data: z.record(z.string(), z.any()).optional(),
	event_admin_id: z.number().optional(),
});

export const updateEventSchema = z.object({
	title: z
		.string()
		.min(3, "Event name must be at least 3 characters")
		.optional(),
	description: z.string().optional(),
	status: z.enum(["draft", "published", "cancelled"]).optional(),
	visibility: z.boolean().optional(),
	use_ticket: z.boolean().optional(),
	use_exhibitor_kit: z.boolean().optional(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	multiple_scans: z.boolean().optional(),
	webhook_url: z.string().url().optional().or(z.literal("")),
	labels_data: z.record(z.string(), z.any()).optional(),
});

// Export types for form data
export type CreateEventRequest = z.infer<typeof createEventSchema>;
export type UpdateEventRequest = z.infer<typeof updateEventSchema>;
