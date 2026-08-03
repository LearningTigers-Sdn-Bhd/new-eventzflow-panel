"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getCheckInEvent } from "@/lib/api/event-check-in";
import {
	createPublicRegistration,
	getPublicPassBundle,
	getPublicRegistrationForms,
	getPublicRegistrationStatus,
	getPublicTicketTypes,
} from "@/lib/api/public-registration";
import {
	type SimpleFormValues,
	simpleRegistrationSchema,
	validateAttendeeCount,
} from "@/lib/api/public-registration/request";
import { submitGroupRegistrations } from "@/lib/api/public-registration/submit";
import { getStatusCopy } from "@/lib/constants/public-registration";

type FormValues = SimpleFormValues;
type SubmitResult = {
	success: boolean;
	paymentStatuses: string[];
	publicIds: string[];
};

function compactCustomFields(fields: Record<string, string | undefined>) {
	return Object.entries(fields).reduce<Record<string, string>>(
		(result, [key, value]) => {
			if (value?.trim()) {
				result[key] = value;
			}
			return result;
		},
		{},
	);
}

export function usePublicRegistrationForm({
	eventSlug,
	formSlug,
	bundleToken,
}: {
	eventSlug: string;
	formSlug: string;
	bundleToken?: string;
}) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [singleResult, setSingleResult] = useState<{
		attendee_name: string;
		public_id: string;
		payment_status: string;
	} | null>(null);
	const [groupResult, setGroupResult] = useState<{
		successCount: number;
		publicIds: string[];
		paymentStatuses: string[];
	} | null>(null);

	const eventQuery = useQuery({
		queryKey: ["public-registration-event", eventSlug],
		queryFn: () => getCheckInEvent(eventSlug),
	});

	const ticketTypesQuery = useQuery({
		queryKey: ["public-registration-ticket-types", eventSlug, formSlug],
		queryFn: () => getPublicTicketTypes(eventSlug, formSlug),
	});

	const registrationFormsQuery = useQuery({
		queryKey: ["public-registration-forms", eventSlug],
		queryFn: () => getPublicRegistrationForms(eventSlug),
	});

	const bundleQuery = useQuery({
		queryKey: ["public-pass-bundle", eventSlug, bundleToken],
		queryFn: () => getPublicPassBundle(eventSlug, bundleToken!),
		enabled: Boolean(bundleToken),
		retry: false,
	});

	const selectedRegistrationForm = registrationFormsQuery.data?.find(
		(form) => form.slug === formSlug,
	);

	async function submit(
		values: FormValues & {
			selectedTicketTypeId?: number;
			leaderEmail?: string;
		},
	): Promise<SubmitResult> {
		setIsSubmitting(true);
		setStatusMessage(null);
		setSingleResult(null);
		setGroupResult(null);

		try {
			const schemaResult = simpleRegistrationSchema.safeParse(values);

			if (!schemaResult.success) {
				const firstError =
					schemaResult.error.issues[0]?.message ?? "Invalid form input";
				throw new Error(firstError);
			}

			const parsed = schemaResult.data;

			// Use explicitly selected ticket type, or fall back to first available
			const ticketTypeId =
				values.selectedTicketTypeId ?? ticketTypesQuery.data?.[0]?.id;

			if (!ticketTypeId) {
				throw new Error("No ticket type available for this registration form.");
			}

			const selectedTicketType =
				ticketTypesQuery.data?.find((item) => item.id === ticketTypeId) ?? null;

			if (!selectedTicketType) {
				throw new Error("Selected ticket type is not available.");
			}

			const attendeeCountError = validateAttendeeCount(
				parsed.attendees.length,
				{
					registration_mode: selectedTicketType.registration_mode,
					min_attendees: selectedTicketType.min_attendees,
					max_attendees: selectedTicketType.max_attendees,
				},
			);

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
					registeredByEmail: values.leaderEmail,
					...(bundleToken ? { bundle: bundleToken } : {}),
					attendees: parsed.attendees.map((attendee) => ({
						attendee_name: attendee.attendee_name,
						attendee_email: attendee.attendee_email,
						attendee_phone: attendee.attendee_phone,
						custom_fields_data: compactCustomFields(
							attendee.custom_fields_data ?? {},
						),
					})),
				});

				if (summary.failedCount > 0) {
					throw new Error(
						`${summary.successCount} successful, ${summary.failedCount} failed.`,
					);
				}

				const successfulRows = summary.rows.filter((row) => row.ok && row.data);
				const publicIds = successfulRows.flatMap((row) =>
					row.data?.public_id ? [row.data.public_id] : [],
				);
				const paymentStatuses = successfulRows.flatMap((row) =>
					row.data?.payment_status ? [row.data.payment_status] : [],
				);
				setGroupResult({
					successCount: summary.successCount,
					publicIds,
					paymentStatuses,
				});

				setStatusMessage(
					`Group registration submitted for ${summary.successCount} attendees.`,
				);
				toast.success(
					`Group registration submitted for ${summary.successCount} attendees.`,
				);
				return {
					success: true,
					paymentStatuses,
					publicIds,
				};
			}

			const attendee = parsed.attendees[0];
			const data = await createPublicRegistration(eventSlug, {
				attendee_name: attendee.attendee_name,
				attendee_email: attendee.attendee_email,
				attendee_phone: attendee.attendee_phone,
				ticket_type_id: ticketTypeId,
				role: "delegate",
				form_slug: formSlug,
				...(bundleToken ? { bundle: bundleToken } : {}),
				custom_fields_data: {
					...sharedCustomFields,
					...compactCustomFields(attendee.custom_fields_data ?? {}),
				},
			});

			setSingleResult({
				attendee_name: data.attendee_name,
				public_id: data.public_id,
				payment_status: data.payment_status,
			});
			setStatusMessage(getStatusCopy(data.payment_status));
			toast.success("Registration submitted successfully");
			return {
				success: true,
				paymentStatuses: [data.payment_status],
				publicIds: [data.public_id],
			};
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Submission failed";
			toast.error(message);
			return { success: false, paymentStatuses: [], publicIds: [] };
		} finally {
			setIsSubmitting(false);
		}
	}

	async function checkExistingRegistration(email: string) {
		return getPublicRegistrationStatus(eventSlug, email, formSlug);
	}

	return {
		eventQuery,
		ticketTypesQuery,
		registrationFormsQuery,
		selectedRegistrationFormName: selectedRegistrationForm?.name ?? null,
		customLabelsData: selectedRegistrationForm?.custom_labels_data ?? [],
		isSubmitting,
		statusMessage,
		singleResult,
		groupResult,
		bundleData: bundleQuery.data ?? null,
		bundleError: bundleQuery.isError,
		checkExistingRegistration,
		submit,
	};
}
