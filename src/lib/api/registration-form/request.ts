import { z } from "zod";

const customLabelEntrySchema = z.object({
	key: z.string(),
	label: z.string(),
});

const ticketTypeRuleSchema = z.object({
	ticket_type_id: z.number().int(),
	registration_mode: z.enum(["single", "group"]),
	min_attendees: z.number().int().min(1),
	max_attendees: z.number().int().min(1).nullable().optional(),
	custom_labels_data: z.array(customLabelEntrySchema).optional(),
});

export const getEventRegistrationFormsSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
});

export const getRegistrationFormSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	registrationFormId: z.string().min(1, "Registration Form ID is required"),
});

export const createRegistrationFormSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	name: z.string().min(1, "Name is required"),
	slug: z.string().min(1, "Slug is required"),
	description: z.string().optional(),
	custom_labels_data: z.array(customLabelEntrySchema).optional(),
	status: z.number().int().optional(),
	position: z.number().int().optional(),
	ticket_type_ids: z.array(z.number()).optional(),
	ticket_type_rules: z.array(ticketTypeRuleSchema).optional(),
});

export const updateRegistrationFormSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	registrationFormId: z.string().min(1, "Registration Form ID is required"),
	name: z.string().min(1).optional(),
	slug: z.string().min(1).optional(),
	description: z.string().optional(),
	custom_labels_data: z.array(customLabelEntrySchema).optional(),
	status: z.number().int().optional(),
	position: z.number().int().optional(),
	ticket_type_ids: z.array(z.number()).optional(),
	ticket_type_rules: z.array(ticketTypeRuleSchema).optional(),
});

export const deleteRegistrationFormSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	registrationFormId: z.string().min(1, "Registration Form ID is required"),
});

export type GetEventRegistrationFormsRequest = z.infer<
	typeof getEventRegistrationFormsSchema
>;
export type GetRegistrationFormRequest = z.infer<
	typeof getRegistrationFormSchema
>;
export type CreateRegistrationFormRequest = z.infer<
	typeof createRegistrationFormSchema
>;
export type UpdateRegistrationFormRequest = z.infer<
	typeof updateRegistrationFormSchema
>;
export type DeleteRegistrationFormRequest = z.infer<
	typeof deleteRegistrationFormSchema
>;
