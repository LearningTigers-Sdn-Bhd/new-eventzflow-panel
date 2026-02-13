"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  PublicTicketTypeItem,
} from "@/lib/api/public-registration";
import { usePublicRegistrationForm } from "@/hooks/use-public-registration-form";
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
  formSlug,
}: {
  eventSlug: string;
  formSlug: string;
}) {
  const [attendees, setAttendees] = useState<AttendeeFormRow[]>([emptyAttendee()]);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number | null>(null);

  const {
    eventQuery,
    ticketTypesQuery,
    isSubmitting,
    singleResult,
    statusMessage,
    submit,
  } = usePublicRegistrationForm({ eventSlug, formSlug });

  const ticketTypes = ticketTypesQuery.data ?? [];
  const hasTicketTypes = ticketTypes.length > 0;
  const hasMultipleTicketTypes = ticketTypes.length > 1;

  const activeTicketType = useMemo(() => {
    if (selectedTicketTypeId) {
      return ticketTypes.find((t) => t.id === selectedTicketTypeId) ?? null;
    }
    return ticketTypes[0] ?? null;
  }, [selectedTicketTypeId, ticketTypes]);

  const loading = eventQuery.isLoading || ticketTypesQuery.isLoading;

  const registrationMode = activeTicketType?.registration_mode ?? "single";
  const minAttendees = activeTicketType?.min_attendees ?? 1;
  const maxAttendees = activeTicketType?.max_attendees ?? null;
  const canAddAttendee = registrationMode === "group" && (!maxAttendees || attendees.length < maxAttendees);

  useEffect(() => {
    if (registrationMode === "single") {
      setAttendees((current) => current.slice(0, 1));
      return;
    }

    setAttendees((current) => {
      if (current.length >= minAttendees) {
        return current;
      }

      const next = [...current];
      while (next.length < minAttendees) {
        next.push(emptyAttendee());
      }
      return next;
    });
  }, [registrationMode, minAttendees]);

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

  function removeAttendee(index: number) {
    if (registrationMode === "group" && attendees.length <= minAttendees) {
      return;
    }

    setAttendees((current) => current.filter((_, i) => i !== index));
  }

  function addAttendee() {
    if (!canAddAttendee) {
      return;
    }

    setAttendees((current) => [...current, emptyAttendee()]);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      attendees: attendees.map(({ row_id, ...attendee }) => attendee),
      selectedTicketTypeId: activeTicketType?.id,
    };

    submit(payload);
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
          {activeTicketType ? (
            <p>
              Current rate: RM {activeTicketType.price.toLocaleString()} {activeTicketType.current_tier ? `(${activeTicketType.current_tier})` : ""}
            </p>
          ) : (
            <p>No ticket type is configured for this registration form.</p>
          )}
        </CardContent>
      </Card>

      {hasTicketTypes ? (
        <form className="space-y-6" onSubmit={onSubmit}>
        {/* Ticket type selector - shown when multiple ticket types mapped to this form */}
        {hasMultipleTicketTypes ? (
          <Card>
            <CardHeader>
              <CardTitle>Select ticket type</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketTypeSelector
                ticketTypes={ticketTypes}
                selectedId={selectedTicketTypeId ?? ticketTypes[0]?.id ?? null}
                onChange={setSelectedTicketTypeId}
              />
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Attendee details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {registrationMode === "group" ? (
              <p className="text-sm text-muted-foreground">
                This ticket type is group registration. Minimum attendees: {minAttendees}
                {maxAttendees ? `, maximum attendees: ${maxAttendees}` : ""}.
              </p>
            ) : null}

            {attendees.map((attendee, index) => (
              <div key={attendee.row_id} className="rounded-lg border p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium text-sm">Attendee {index + 1}</p>
                  {attendees.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={registrationMode === "group" && attendees.length <= minAttendees}
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

            {registrationMode === "group" ? (
              <Button
                type="button"
                variant="outline"
                onClick={addAttendee}
                disabled={!canAddAttendee}
              >
                Add attendee
              </Button>
            ) : null}

            <Button type="submit" disabled={isSubmitting || !activeTicketType}>
              {isSubmitting ? "Submitting..." : "Submit registration"}
            </Button>
          </CardContent>
        </Card>
        </form>
      ) : null}

      {singleResult && statusMessage ? (
        <SubmissionStatusPanel
          attendeeName={singleResult.attendee_name}
          publicId={singleResult.public_id}
          message={statusMessage}
        />
      ) : null}
    </div>
  );
}

function TicketTypeSelector({
  ticketTypes,
  selectedId,
  onChange,
}: {
  ticketTypes: PublicTicketTypeItem[];
  selectedId: number | null;
  onChange: (id: number) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {ticketTypes.map((tt) => {
        const active = selectedId === tt.id;
        return (
          <Button
            key={tt.id}
            type="button"
            variant={active ? "default" : "outline"}
            className={cn("h-auto flex-col items-start p-3 text-left")}
            onClick={() => onChange(tt.id)}
          >
            <span className="font-medium text-sm">{tt.name}</span>
            <span className="text-xs opacity-80">
              RM {tt.price.toLocaleString()}
              {tt.current_tier ? ` (${tt.current_tier})` : ""}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
