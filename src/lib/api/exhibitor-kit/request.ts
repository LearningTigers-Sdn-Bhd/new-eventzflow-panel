import { z } from "zod";

// Team member schema for nested attributes
export const exhibitorTeamMemberSchema = z.object({
	id: z.number().optional(),
	full_name: z.string().min(1, "Full name is required"),
	_destroy: z.boolean().optional(),
});

// Booth type enum
export const boothTypeEnum = z.enum(["shell_scheme", "raw_space"]);

// Payment status enum
export const paymentStatusEnum = z.enum(["unpaid", "paid", "waived", "sponsored"]);

// Create exhibitor kit schema
export const createExhibitorKitSchema = z.object({
	event_vendor_id: z.number().optional(), // Required when creating directly via exhibitor_kits endpoint
	booth_number: z.string().min(1, "Booth number is required"),
	booth_type: boothTypeEnum,
	booth_dimensions: z.string().optional(),
	side_wall_left_required: z.boolean().default(false),
	side_wall_right_required: z.boolean().default(false),
	name_on_fascia: z.string().max(25, "Name on fascia must be 25 characters or less"),
	fascia_upgrade_required: z.boolean().default(false),
	company_name: z.string().min(1, "Company name is required"),
	company_address: z.string().min(1, "Company address is required"),
	pic_full_name: z.string().min(1, "PIC full name is required"),
	pic_contact_number: z.string().min(1, "PIC contact number is required"),
	pic_email_address: z.string().email("Must be a valid email address"),
	extra_crew_count: z.number().min(0).default(0),
	special_requirements: z.string().optional(),
	digital_brochure_link: z.string().url().optional().or(z.literal("")),
	contractor_company_name: z.string().optional(),
	contractor_pic_name: z.string().optional(),
	contractor_pic_contact: z.string().optional(),
	stand_design_file_url: z.string().url().optional().or(z.literal("")),
	furniture_requests: z.record(z.string(), z.unknown()).optional(),
	electrical_requests: z.record(z.string(), z.unknown()).optional(),
	printing_orders: z.record(z.string(), z.unknown()).optional(),
	indemnity_signed: z.boolean().default(false),
	indemnity_document_url: z.string().url().optional().or(z.literal("")),
	payment_status: paymentStatusEnum.default("unpaid"),
	amount_paid: z.string().optional(),
	payment_note: z.string().optional(),
	indemnity_link: z.string().url().optional().or(z.literal("")),
	exhibitor_team_members_attributes: z.array(exhibitorTeamMemberSchema).optional(),
});

// Update exhibitor kit schema (all fields optional, no defaults applied)
export const updateExhibitorKitSchema = z.object({
	event_vendor_id: z.number().optional(),
	booth_number: z.string().optional(),
	booth_type: boothTypeEnum.optional(),
	booth_dimensions: z.string().optional(),
	side_wall_left_required: z.boolean().optional(),
	side_wall_right_required: z.boolean().optional(),
	name_on_fascia: z.string().max(25).optional(),
	fascia_upgrade_required: z.boolean().optional(),
	company_name: z.string().optional(),
	company_address: z.string().optional(),
	pic_full_name: z.string().optional(),
	pic_contact_number: z.string().optional(),
	pic_email_address: z.string().email().optional(),
	extra_crew_count: z.number().min(0).optional(),
	special_requirements: z.string().optional(),
	digital_brochure_link: z.string().url().optional().or(z.literal("")),
	contractor_company_name: z.string().optional(),
	contractor_pic_name: z.string().optional(),
	contractor_pic_contact: z.string().optional(),
	stand_design_file_url: z.string().url().optional().or(z.literal("")),
	furniture_requests: z.record(z.string(), z.unknown()).optional(),
	electrical_requests: z.record(z.string(), z.unknown()).optional(),
	printing_orders: z.record(z.string(), z.unknown()).optional(),
	indemnity_signed: z.boolean().optional(),
	indemnity_document_url: z.string().url().optional().or(z.literal("")),
	payment_status: paymentStatusEnum.optional(),
	amount_paid: z.string().optional(),
	payment_note: z.string().optional(),
	indemnity_link: z.string().url().optional().or(z.literal("")),
	exhibitor_team_members_attributes: z.array(exhibitorTeamMemberSchema).optional(),
});

// Export types for form data
export type CreateExhibitorKitRequest = z.infer<typeof createExhibitorKitSchema>;
export type UpdateExhibitorKitRequest = z.infer<typeof updateExhibitorKitSchema>;
export type ExhibitorTeamMemberInput = z.infer<typeof exhibitorTeamMemberSchema>;
