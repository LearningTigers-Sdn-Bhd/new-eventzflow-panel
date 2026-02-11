"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  ConferenceRegistrationKind,
  PublicRegistrationMode,
} from "@/lib/api/public-registration";
import {
  buildTicketTypeMap,
  resolveTicketTypeId,
} from "@/lib/api/public-registration";
import { usePublicRegistrationForm } from "@/hooks/use-public-registration-form";
import { ConferenceModeSelector } from "./ConferenceModeSelector";
import { GroupSubmissionResultTable } from "./GroupSubmissionResultTable";
import { SubmissionStatusPanel } from "./SubmissionStatusPanel";

interface AttendeeFormRow {
  row_id: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  company_name: string;
  job_title: string;
  country: string;
}

const emptyAttendee = (): AttendeeFormRow => ({
  row_id: crypto.randomUUID(),
  attendee_name: "",
  attendee_email: "",
  attendee_phone: "",
  company_name: "",
  job_title: "",
  country: "",
});

export function PublicRegistrationForm({
  eventSlug,
  mode,
}: {
  eventSlug: string;
  mode: PublicRegistrationMode;
}) {
  const [conferenceKind, setConferenceKind] =
    useState<ConferenceRegistrationKind>("individual");
  const [membershipNumber, setMembershipNumber] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [country, setCountry] = useState("");
  const [attendees, setAttendees] = useState<AttendeeFormRow[]>([emptyAttendee()]);

  const {
    eventQuery,
    ticketTypesQuery,
    isSubmitting,
    singleResult,
    statusMessage,
    groupSummary,
    retryFailedGroup,
    submit,
  } = usePublicRegistrationForm({ eventSlug, mode });

  const ticketTypeMap = useMemo(
    () => buildTicketTypeMap(ticketTypesQuery.data ?? []),
    [ticketTypesQuery.data],
  );

  const activeTicketInfo = useMemo(() => {
    try {
      const id = resolveTicketTypeId(mode, conferenceKind, ticketTypeMap);
      return (ticketTypesQuery.data ?? []).find((item) => item.id === id) ?? null;
    } catch {
      return null;
    }
  }, [mode, conferenceKind, ticketTypeMap, ticketTypesQuery.data]);

  const loading = eventQuery.isLoading || ticketTypesQuery.isLoading;

  function updateAttendee(index: number, key: keyof AttendeeFormRow, value: string) {
    setAttendees((current) => {
      const next = [...current];
      next[index] = {
        ...next[index],
        [key]: value,
      };
      return next;
    });
  }

  function addAttendee() {
    setAttendees((current) => [...current, emptyAttendee()]);
  }

  function removeAttendee(index: number) {
    setAttendees((current) => current.filter((_, i) => i !== index));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      registrationKind: conferenceKind,
      membership_number: membershipNumber,
      organization_name: organizationName,
      country,
      attendees: attendees.map(({ row_id, ...attendee }) => attendee),
    };

    submit(payload);
  }

  async function handleRetryFailedOnly() {
    if (!groupSummary) {
      return;
    }

    const failedAttendees = groupSummary.rows
      .filter((row) => !row.ok)
      .map((row) => {
        const source = attendees.find((item) => item.attendee_name === row.attendee_name);
        return {
          attendee_name: row.attendee_name,
          attendee_email: source?.attendee_email,
          attendee_phone: source?.attendee_phone,
          custom_fields_data: {
            company_name: source?.company_name ?? "",
            job_title: source?.job_title ?? "",
            country: source?.country ?? "",
          },
        };
      });

    if (failedAttendees.length === 0) {
      return;
    }

    await retryFailedGroup(failedAttendees, conferenceKind);
  }

  if (loading) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Loading registration form...</div>;
  }

  if (eventQuery.isError || ticketTypesQuery.isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        Unable to load registration settings for this event.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{eventQuery.data?.title ?? "Event registration"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>Current form: {mode.toUpperCase()}</p>
          {activeTicketInfo ? (
            <p>
              Current rate: RM {activeTicketInfo.price.toLocaleString()} {activeTicketInfo.current_tier ? `(${activeTicketInfo.current_tier})` : ""}
            </p>
          ) : (
            <p>Ticket type is not configured for this registration option.</p>
          )}
        </CardContent>
      </Card>

      <form className="space-y-6" onSubmit={onSubmit}>
        {mode === "conference" ? (
          <Card>
            <CardHeader>
              <CardTitle>Conference category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ConferenceModeSelector value={conferenceKind} onChange={setConferenceKind} />

              {conferenceKind === "member" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Membership number"
                    value={membershipNumber}
                    onChange={(event) => setMembershipNumber(event.target.value)}
                  />
                  <Input
                    placeholder="Organization name"
                    value={organizationName}
                    onChange={(event) => setOrganizationName(event.target.value)}
                  />
                </div>
              ) : null}

              {conferenceKind === "international" ? (
                <Input
                  placeholder="Country"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                />
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>
              Attendee details
              {mode === "conference" && conferenceKind === "group"
                ? " (minimum 3)"
                : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {attendees.map((attendee, index) => (
              <div key={attendee.row_id} className="rounded-lg border p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium text-sm">Attendee {index + 1}</p>
                  {attendees.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttendee(index)}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    placeholder="Full name"
                    value={attendee.attendee_name}
                    onChange={(event) =>
                      updateAttendee(index, "attendee_name", event.target.value)
                    }
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={attendee.attendee_email}
                    onChange={(event) =>
                      updateAttendee(index, "attendee_email", event.target.value)
                    }
                  />
                  <Input
                    placeholder="Phone"
                    value={attendee.attendee_phone}
                    onChange={(event) =>
                      updateAttendee(index, "attendee_phone", event.target.value)
                    }
                  />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Input
                    placeholder="Company"
                    value={attendee.company_name}
                    onChange={(event) =>
                      updateAttendee(index, "company_name", event.target.value)
                    }
                  />
                  <Input
                    placeholder="Job title"
                    value={attendee.job_title}
                    onChange={(event) =>
                      updateAttendee(index, "job_title", event.target.value)
                    }
                  />
                  <Input
                    placeholder="Country"
                    value={attendee.country}
                    onChange={(event) =>
                      updateAttendee(index, "country", event.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            {mode === "conference" && conferenceKind === "group" ? (
              <Button type="button" variant="outline" onClick={addAttendee}>
                Add attendee
              </Button>
            ) : null}

            <Button type="submit" disabled={isSubmitting || !activeTicketInfo}>
              {isSubmitting ? "Submitting..." : "Submit registration"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {singleResult && statusMessage ? (
        <SubmissionStatusPanel
          attendeeName={singleResult.attendee_name}
          publicId={singleResult.public_id}
          message={statusMessage}
        />
      ) : null}

      {groupSummary ? (
        <GroupSubmissionResultTable
          summary={groupSummary}
          onRetryFailed={handleRetryFailedOnly}
          retrying={isSubmitting}
        />
      ) : null}
    </div>
  );
}
