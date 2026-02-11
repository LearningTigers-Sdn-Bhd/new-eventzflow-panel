import type {
  ConferenceRegistrationKind,
  PublicRegistrationMode,
} from "@/lib/api/public-registration";

export interface RegistrationOption {
  key: PublicRegistrationMode;
  title: string;
  description: string;
}

export const REGISTRATION_OPTIONS: RegistrationOption[] = [
  {
    key: "conference",
    title: "Conference Delegate",
    description:
      "Register as a delegate with standard, member, international, or group options.",
  },
  {
    key: "visitor",
    title: "Visitor Pre-Registration",
    description: "Fast, free visitor registration for exhibition access.",
  },
  {
    key: "golf",
    title: "Golf Day Registration",
    description: "Register for OGSE Golf Day on Day 3.",
  },
];

export interface ConferenceKindOption {
  key: ConferenceRegistrationKind;
  title: string;
  description: string;
}

export const CONFERENCE_KIND_OPTIONS: ConferenceKindOption[] = [
  {
    key: "individual",
    title: "Standard Delegate",
    description: "Single delegate registration.",
  },
  {
    key: "member",
    title: "SOGSC/PKPBS Member",
    description: "Member rate (requires membership details).",
  },
  {
    key: "international",
    title: "International Delegate",
    description: "For attendees outside Malaysia.",
  },
  {
    key: "group",
    title: "Group Registration (3+)",
    description: "Register multiple delegates in one flow.",
  },
];

export type TicketTypeMapKey =
  | "conference_individual"
  | "conference_member"
  | "conference_international"
  | "conference_group"
  | "visitor"
  | "golf";

export function getStatusCopy(status: string) {
  if (status === "paid") {
    return "Registration confirmed. Your QR ticket has been generated.";
  }
  if (status === "pending") {
    return "Registration received. Payment instructions will follow from the organizer.";
  }
  return "Registration submitted. Our team will contact you with next steps.";
}
