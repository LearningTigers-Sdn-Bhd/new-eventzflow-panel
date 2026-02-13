import { z } from "zod";

export interface TicketRegistrationRule {
  registration_mode: "single" | "group";
  min_attendees: number;
  max_attendees?: number | null;
}

export const attendeeSchema = z.object({
  attendee_name: z.string().min(2, "Name is required"),
  attendee_email: z
    .string()
    .email("Please enter a valid email")
    .or(z.literal(""))
    .transform((value) => value || undefined),
  attendee_phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s\-()]+$/, "Please enter a valid phone number")
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

export const simpleRegistrationSchema = z.object({
  attendees: z.array(attendeeSchema).min(1),
});

export function validateAttendeeCount(
  attendeeCount: number,
  rule: TicketRegistrationRule,
): string | null {
  if (rule.registration_mode === "single" && attendeeCount !== 1) {
    return "This ticket type allows exactly 1 attendee.";
  }

  if (attendeeCount < rule.min_attendees) {
    return `This ticket type requires at least ${rule.min_attendees} attendees.`;
  }

  if (rule.max_attendees && attendeeCount > rule.max_attendees) {
    return `This ticket type allows up to ${rule.max_attendees} attendees.`;
  }

  return null;
}

export type SimpleFormValues = z.infer<typeof simpleRegistrationSchema>;
