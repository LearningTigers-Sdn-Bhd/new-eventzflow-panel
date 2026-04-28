import { z } from "zod";

export const getRegistrationFormRsvpSettingSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	registrationFormId: z.string().min(1, "Registration form ID is required"),
});

export const updateRegistrationFormRsvpSettingSchema = z.object({
	eventId: z.string().min(1, "Event ID is required"),
	registrationFormId: z.string().min(1, "Registration form ID is required"),
	enabled: z.boolean(),
	rsvp_required: z.boolean(),
	rsvp_expires_in_hours: z.number().int().min(1).nullable(),
	review_sla_hours: z.number().int().min(1),
	notify_by_date: z.string().datetime().nullable(),
});

export type GetRegistrationFormRsvpSettingRequest = z.infer<
	typeof getRegistrationFormRsvpSettingSchema
>;

export type UpdateRegistrationFormRsvpSettingRequest = z.infer<
	typeof updateRegistrationFormRsvpSettingSchema
>;
