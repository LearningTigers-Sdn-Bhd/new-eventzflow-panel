"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createPublicRegistration,
  getPublicTicketTypes,
  type ConferenceRegistrationKind,
  type PublicRegistrationMode,
} from "@/lib/api/public-registration";
import { getCheckInEvent } from "@/lib/api/event-check-in";
import { getStatusCopy } from "@/lib/constants/public-registration";
import { buildTicketTypeMap, resolveTicketTypeId } from "@/lib/api/public-registration/resolver";
import {
  conferenceSchema,
  simpleRegistrationSchema,
  type ConferenceFormValues,
  type SimpleFormValues,
} from "@/lib/api/public-registration/request";
import { submitGroupRegistrations, type GroupSubmissionSummary } from "@/lib/api/public-registration/submit";

type FormValues = ConferenceFormValues | SimpleFormValues;

function compactCustomFields(fields: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => Boolean(value?.trim())),
  );
}

export function usePublicRegistrationForm({
  eventSlug,
  mode,
}: {
  eventSlug: string;
  mode: PublicRegistrationMode;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<{
    attendee_name: string;
    public_id: string;
    payment_status: string;
  } | null>(null);
  const [groupSummary, setGroupSummary] = useState<GroupSubmissionSummary | null>(null);

  const eventQuery = useQuery({
    queryKey: ["public-registration-event", eventSlug],
    queryFn: () => getCheckInEvent(eventSlug),
  });

  const ticketTypesQuery = useQuery({
    queryKey: ["public-registration-ticket-types", eventSlug],
    queryFn: () => getPublicTicketTypes(eventSlug),
  });

  const ticketTypeMap = useMemo(
    () => buildTicketTypeMap(ticketTypesQuery.data ?? []),
    [ticketTypesQuery.data],
  );

  const modePriceInfo = useMemo(() => {
    if (mode === "visitor") return ticketTypeMap.visitor;
    if (mode === "golf") return ticketTypeMap.golf;
    return ticketTypeMap.conference_individual;
  }, [mode, ticketTypeMap]);

  async function retryFailedGroup(
    attendees: Array<{
      attendee_name: string;
      attendee_email?: string;
      attendee_phone?: string;
      custom_fields_data?: Record<string, string>;
    }>,
    conferenceKind: ConferenceRegistrationKind,
  ) {
    setIsSubmitting(true);
    try {
      const ticketTypeId = resolveTicketTypeId("conference", conferenceKind, ticketTypeMap);
      const summary = await submitGroupRegistrations({
        eventSlug,
        ticketTypeId,
        role: "delegate",
        sharedCustomFields: compactCustomFields({
          registration_mode: "conference",
          conference_kind: conferenceKind,
        }),
        attendees,
      });
      setGroupSummary(summary);
      if (summary.failedCount > 0) {
        toast.warning(
          `${summary.successCount} successful, ${summary.failedCount} failed.`,
        );
      } else {
        toast.success(`Retry completed. ${summary.successCount} delegates registered.`);
      }
      return summary;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Retry failed";
      toast.error(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submit(values: FormValues) {
    setIsSubmitting(true);
    setStatusMessage(null);
    setSingleResult(null);
    setGroupSummary(null);

    try {
      const conferenceKind =
        mode === "conference"
          ? (values as ConferenceFormValues).registrationKind
          : ("individual" as ConferenceRegistrationKind);

      const schemaResult =
        mode === "conference"
          ? conferenceSchema.safeParse(values)
          : simpleRegistrationSchema.safeParse(values);

      if (!schemaResult.success) {
        const firstError = schemaResult.error.issues[0]?.message ?? "Invalid form input";
        throw new Error(firstError);
      }

      const parsed = schemaResult.data;
      const ticketTypeId = resolveTicketTypeId(mode, conferenceKind, ticketTypeMap);
      const conferenceValues =
        mode === "conference" ? (parsed as ConferenceFormValues) : null;
      const sharedCustomFields = compactCustomFields({
        registration_mode: mode,
        conference_kind: mode === "conference" ? conferenceKind : undefined,
        membership_number: conferenceValues?.membership_number,
        organization_name: conferenceValues?.organization_name,
        country: conferenceValues?.country,
      });

      if (mode === "conference" && conferenceKind === "group") {
        const summary = await submitGroupRegistrations({
          eventSlug,
          ticketTypeId,
          role: "delegate",
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

        setGroupSummary(summary);
        if (summary.failedCount > 0) {
          toast.warning(
            `${summary.successCount} successful, ${summary.failedCount} failed. Retry failed attendees only.`,
          );
        } else {
          toast.success(`All ${summary.successCount} delegates registered.`);
        }
        return;
      }

      const attendee = parsed.attendees[0];
      const data = await createPublicRegistration(eventSlug, {
        attendee_name: attendee.attendee_name,
        attendee_email: attendee.attendee_email,
        attendee_phone: attendee.attendee_phone,
        ticket_type_id: ticketTypeId,
        role: mode === "visitor" ? "visitor" : "delegate",
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
    ticketTypeMap,
    modePriceInfo,
    isSubmitting,
    statusMessage,
    singleResult,
    groupSummary,
    retryFailedGroup,
    submit,
  };
}
