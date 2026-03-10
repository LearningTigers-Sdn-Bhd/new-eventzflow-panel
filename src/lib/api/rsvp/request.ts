import { z } from "zod";

export const rsvpCompanionSchema = z.object({
	full_name: z.string().min(1, "Name is required"),
	phone: z.string().optional(),
	email: z.string().email("Must be a valid email").or(z.literal("")).optional(),
});

export const rsvpRespondSchema = z.object({
	rsvp_status: z.enum(["attending", "declined"]),
	companions: z.array(rsvpCompanionSchema).optional(),
});

export type RsvpCompanionRequest = z.infer<typeof rsvpCompanionSchema>;
export type RsvpRespondRequest = z.infer<typeof rsvpRespondSchema>;
