import { z } from "zod";

export const attendeeSchema = z.object({
  attendee_name: z.string().min(2, "Name is required"),
  attendee_email: z
    .string()
    .email("Please enter a valid email")
    .or(z.literal(""))
    .transform((value) => value || undefined),
  attendee_phone: z
    .string()
    .min(8, "Please enter a valid phone number")
    .or(z.literal(""))
    .transform((value) => value || undefined),
  company_name: z
    .string()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  job_title: z
    .string()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  country: z
    .string()
    .or(z.literal(""))
    .transform((value) => value || undefined),
});

export const conferenceSchema = z
  .object({
    registrationKind: z.enum(["individual", "member", "international", "group"]),
    membership_number: z.string().optional(),
    organization_name: z.string().optional(),
    country: z.string().optional(),
    attendees: z.array(attendeeSchema).min(1),
  })
  .superRefine((value, ctx) => {
    if (value.registrationKind === "group" && value.attendees.length < 3) {
      ctx.addIssue({
        code: "custom",
        path: ["attendees"],
        message: "Group registration requires at least 3 attendees.",
      });
    }

    if (value.registrationKind === "member" && !value.membership_number?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["membership_number"],
        message: "Membership number is required for member registration.",
      });
    }

    if (value.registrationKind === "international" && !value.country?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["country"],
        message: "Country is required for international registration.",
      });
    }
  });

export const simpleRegistrationSchema = z.object({
  attendees: z.array(attendeeSchema).length(1),
});

export type ConferenceFormValues = z.infer<typeof conferenceSchema>;
export type SimpleFormValues = z.infer<typeof simpleRegistrationSchema>;
