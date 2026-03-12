import { z } from "zod";

// Team member schema for nested attributes
export const exhibitorTeamMemberSchema = z
	.object({
		id: z.number().optional(),
		full_name: z.string(),
		email: z.string(),
		phone: z.string(),
		_destroy: z.boolean().optional(),
	})
	.superRefine((data, ctx) => {
		if (data._destroy === true) return;

		if (data.full_name.trim().length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["full_name"],
				message: "Full name is required",
			});
		}

		if (
			data.email.trim().length === 0 ||
			!z.email().safeParse(data.email).success
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["email"],
				message: "Valid email is required",
			});
		}

		if (data.phone.trim().length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["phone"],
				message: "Phone number is required",
			});
		}
	});

// Exhibitor kit item schema for nested attributes
export const exhibitorKitItemSchema = z.object({
	id: z.number().optional(),
	rentable_item_id: z.number().optional(),
	quantity: z.number().min(1, "Quantity must be at least 1").optional(),
	agreed_price: z.number().min(0, "Price must be positive").optional(),
	notes: z.string().nullable().optional(),
	_destroy: z.boolean().optional(),
});

// Exhibitor kit printing schema for nested attributes
export const exhibitorKitPrintingSchema = z.object({
	id: z.number().optional(),
	printing_service_id: z.number().optional(),
	quantity: z.number().min(1, "Quantity must be at least 1").optional(),
	agreed_price: z.number().min(0, "Price must be positive").optional(),
	notes: z.string().nullable().optional(),
	file_reference: z.string().nullable().optional(),
	_destroy: z.boolean().optional(),
});

// Custom request status enum
export const customRequestStatusEnum = z.enum([
	"pending",
	"approved",
	"rejected",
]);

// Custom request schema for nested attributes
export const customRequestSchema = z
	.object({
		id: z.number().optional(),
		description: z.string().optional(),
		quantity: z.number().min(0, "Quantity must be 0 or more").optional(),
		status: customRequestStatusEnum.optional(),
		resolved_price: z.number().min(0).optional(),
		response_notes: z.string().optional(),
		_destroy: z.boolean().optional(),
	})
	.refine(
		(data) =>
			data._destroy === true ||
			(data.description && data.description.length >= 1),
		{ message: "Description is required", path: ["description"] },
	);

// Booth type validation
export const boothTypeEnum = z.string().optional();

// Payment status enum
export const paymentStatusEnum = z.enum([
	"unpaid",
	"paid",
	"waived",
	"sponsored",
]);

// Create exhibitor kit schema
export const createExhibitorKitSchema = z.object({
	event_vendor_id: z.number().optional(), // Required when creating directly via exhibitor_kits endpoint
	booth_number: z.string().optional(),
	booth_type: z.string().optional(),
	booth_dimensions: z.string().optional(),
	side_wall_left_required: z.boolean().optional(),
	side_wall_right_required: z.boolean().optional(),
	name_on_fascia: z
		.string()
		.max(30, "Name on fascia must be 30 characters or less")
		.optional(),
	fascia_upgrade_required: z.boolean().optional(),
	company_name: z.string().optional(),
	company_address: z.string().optional(),
	country: z.string().optional(),
	pic_full_name: z.string().optional(),
	pic_contact_number: z.string().optional(),
	pic_email_address: z
		.string()
		.email("Must be a valid email address")
		.optional(),
	special_requirements: z.string().optional(),
	digital_brochure_link: z.string().url().optional().or(z.literal("")),
	indemnity_signed: z.boolean().optional(),
	indemnity_document_url: z.string().url().optional().or(z.literal("")),
	payment_status: paymentStatusEnum.optional(),
	amount_paid: z.string().optional(),
	payment_note: z.string().optional(),
	indemnity_link: z.string().url().optional().or(z.literal("")),
	custom_fields_data: z.record(z.string(), z.unknown()).optional(),
	exhibitor_team_members_attributes: z
		.array(exhibitorTeamMemberSchema)
		.optional(),
	exhibitor_kit_items_attributes: z.array(exhibitorKitItemSchema).optional(),
	exhibitor_kit_printings_attributes: z
		.array(exhibitorKitPrintingSchema)
		.optional(),
	custom_requests_attributes: z.array(customRequestSchema).optional(),
});

// Update exhibitor kit schema (all fields optional, no defaults applied)
export const updateExhibitorKitSchema = z.object({
	event_vendor_id: z.number().optional(),
	booth_number: z.string().optional(),
	booth_type: z.string().optional(),
	booth_dimensions: z.string().optional(),
	side_wall_left_required: z.boolean().optional(),
	side_wall_right_required: z.boolean().optional(),
	name_on_fascia: z.string().max(30).optional(),
	fascia_upgrade_required: z.boolean().optional(),
	company_name: z.string().optional(),
	company_address: z.string().optional(),
	country: z.string().optional(),
	pic_full_name: z.string().optional(),
	pic_contact_number: z.string().optional(),
	pic_email_address: z.string().email().optional(),
	special_requirements: z.string().optional(),
	digital_brochure_link: z.string().url().optional().or(z.literal("")),
	indemnity_signed: z.boolean().optional(),
	indemnity_document_url: z.string().url().optional().or(z.literal("")),
	payment_status: paymentStatusEnum.optional(),
	amount_paid: z.string().optional(),
	payment_note: z.string().optional(),
	indemnity_link: z.string().url().optional().or(z.literal("")),
	custom_fields_data: z.record(z.string(), z.unknown()).optional(),
	exhibitor_team_members_attributes: z
		.array(exhibitorTeamMemberSchema)
		.optional(),
	exhibitor_kit_items_attributes: z.array(exhibitorKitItemSchema).optional(),
	exhibitor_kit_printings_attributes: z
		.array(exhibitorKitPrintingSchema)
		.optional(),
	custom_requests_attributes: z.array(customRequestSchema).optional(),
});

// Export types for form data
export type CreateExhibitorKitRequest = z.infer<
	typeof createExhibitorKitSchema
>;
export type UpdateExhibitorKitRequest = z.infer<
	typeof updateExhibitorKitSchema
>;
export type ExhibitorTeamMemberInput = z.infer<
	typeof exhibitorTeamMemberSchema
>;
export type ExhibitorKitItemInput = z.infer<typeof exhibitorKitItemSchema>;
export type ExhibitorKitPrintingInput = z.infer<
	typeof exhibitorKitPrintingSchema
>;
export type CustomRequestInput = z.infer<typeof customRequestSchema>;
export type CustomRequestStatus = z.infer<typeof customRequestStatusEnum>;
