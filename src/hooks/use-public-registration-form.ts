"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  createPublicRegistration,
  getPublicTicketTypes,
} from "@/lib/api/public-registration";
import { getCheckInEvent } from "@/lib/api/event-check-in";
import { getStatusCopy } from "@/lib/constants/public-registration";
import {
  simpleRegistrationSchema,
  type SimpleFormValues,
  validateAttendeeCount,
} from "@/lib/api/public-registration/request";
import { submitGroupRegistrations } from "@/lib/api/public-registration/submit";

type FormValues = SimpleFormValues;

function compactCustomFields(fields: Record<string, string | undefined>) {
  return Object.entries(fields).reduce<Record<string, string>>((result, [key, value]) => {
    if (value?.trim()) {
      result[key] = value;
    }
    return result;
  }, {});
}

export function usePublicRegistrationForm({
  eventSlug,
  formSlug,
}: {
  eventSlug: string;
  formSlug: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<{
    attendee_name: string;
    public_id: string;
    payment_status: string;
  } | null>(null);

  const eventQuery = useQuery({
    queryKey: ["public-registration-event", eventSlug],
    queryFn: () => getCheckInEvent(eventSlug),
  });

  const ticketTypesQuery = useQuery({
    queryKey: ["public-registration-ticket-types", eventSlug, formSlug],
    queryFn: () => getPublicTicketTypes(eventSlug, formSlug),
  });

  async function submit(values: FormValues & { selectedTicketTypeId?: number }) {
    setIsSubmitting(true);
    setStatusMessage(null);
    setSingleResult(null);

    try {
      const schemaResult = simpleRegistrationSchema.safeParse(values);

      if (!schemaResult.success) {
        const firstError = schemaResult.error.issues[0]?.message ?? "Invalid form input";
        throw new Error(firstError);
      }

      const parsed = schemaResult.data;

      // Use explicitly selected ticket type, or fall back to first available
      const ticketTypeId =
        values.selectedTicketTypeId ??
        ticketTypesQuery.data?.[0]?.id;

      if (!ticketTypeId) {
        throw new Error("No ticket type available for this registration form.");
      }

      const selectedTicketType =
        ticketTypesQuery.data?.find((item) => item.id === ticketTypeId) ?? null;

      if (!selectedTicketType) {
        throw new Error("Selected ticket type is not available.");
      }

      const attendeeCountError = validateAttendeeCount(parsed.attendees.length, {
        registration_mode: selectedTicketType.registration_mode,
        min_attendees: selectedTicketType.min_attendees,
        max_attendees: selectedTicketType.max_attendees,
      });

      if (attendeeCountError) {
        throw new Error(attendeeCountError);
      }

      const sharedCustomFields = compactCustomFields({
        registration_mode: formSlug,
      });

      if (selectedTicketType.registration_mode === "group") {
        const summary = await submitGroupRegistrations({
          eventSlug,
          ticketTypeId,
          role: "delegate",
          formSlug,
          sharedCustomFields,
          attendees: parsed.attendees.map((attendee) => ({
            attendee_name: attendee.attendee_name,
            attendee_email: attendee.attendee_email,
            attendee_phone: attendee.attendee_phone,
            custom_fields_data: compactCustomFields({
              company_name: attendee.company_name,
              job_title: attendee.job_title,
              country: attendee.country,
            }),
          })),
        });

        if (summary.failedCount > 0) {
          throw new Error(`${summary.successCount} successful, ${summary.failedCount} failed.`);
        }

        setStatusMessage(`Group registration submitted for ${summary.successCount} attendees.`);
        toast.success(`Group registration submitted for ${summary.successCount} attendees.`);
        return;
      }

      const attendee = parsed.attendees[0];
      const data = await createPublicRegistration(eventSlug, {
        attendee_name: attendee.attendee_name,
        attendee_email: attendee.attendee_email,
        attendee_phone: attendee.attendee_phone,
        ticket_type_id: ticketTypeId,
        role: "delegate",
        form_slug: formSlug,
        custom_fields_data: {
          ...sharedCustomFields,
          ...compactCustomFields({
            company_name: attendee.company_name,
            job_title: attendee.job_title,
            country: attendee.country,
          }),
        },
      });

      setSingleResult({
        attendee_name: data.attendee_name,
        public_id: data.public_id,
        payment_status: data.payment_status,
      });
      setStatusMessage(getStatusCopy(data.payment_status));
      toast.success("Registration submitted successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Submission failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    eventQuery,
    ticketTypesQuery,
    isSubmitting,
    statusMessage,
    singleResult,
    submit,
  };
}
