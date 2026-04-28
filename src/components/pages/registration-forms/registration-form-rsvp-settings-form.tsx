"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";
import * as React from "react";
import { useId } from "react";
import { toast } from "sonner";
import { z } from "zod";
import DateTimePickerField from "@/components/admin-ui/form/date-time-picker";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { NumberInputLabel } from "@/components/admin-ui/form/number-input-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import {
	getRegistrationFormRsvpSetting,
	updateRegistrationFormRsvpSetting,
} from "@/lib/api/registration-form-rsvp-setting";
import { queryClient } from "@/utils/rest-api";

const formSchema = z.object({
	enabled: z.boolean(),
	rsvpRequired: z.boolean(),
	neverExpires: z.boolean(),
	rsvpExpiresInHours: z.number().int().min(1),
	reviewSlaHours: z.number().int().min(1),
	notifyByDate: z.date().nullable(),
});

interface RegistrationFormRsvpSettingsFormProps {
	eventId: string;
	registrationFormId: string;
	onClose?: () => void;
}

export function RegistrationFormRsvpSettingsForm({
	eventId,
	registrationFormId,
	onClose,
}: RegistrationFormRsvpSettingsFormProps) {
	const formId = useId();
	const hasInitialized = React.useRef<number | null>(null);

	const { data, isLoading, error } = useQuery({
		queryKey: ["event", eventId, "registration-form", registrationFormId, "rsvp-setting"],
		queryFn: () => getRegistrationFormRsvpSetting({ eventId, registrationFormId }),
	});

	const mutation = useMutation({
		mutationFn: updateRegistrationFormRsvpSetting,
		onSuccess: () => {
			toast.success("Delegate approval & RSVP settings updated");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "registration-form", registrationFormId, "rsvp-setting"],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "registration-forms"],
			});
			onClose?.();
		},
		onError: (err: Error) => {
			toast.error(err.message || "Failed to update settings");
		},
	});

	const form = useForm({
		defaultValues: {
			enabled: false,
			rsvpRequired: false,
			neverExpires: true,
			rsvpExpiresInHours: 72,
			reviewSlaHours: 48,
			notifyByDate: null as Date | null,
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync({
				eventId,
				registrationFormId,
				enabled: value.enabled,
				rsvp_required: value.rsvpRequired,
				rsvp_expires_in_hours: value.neverExpires ? null : value.rsvpExpiresInHours,
				review_sla_hours: value.reviewSlaHours,
				notify_by_date: value.notifyByDate ? value.notifyByDate.toISOString() : null,
			});
		},
	});

	React.useEffect(() => {
		if (!data || hasInitialized.current === data.id) {
			return;
		}

		form.setFieldValue("enabled", data.enabled);
		form.setFieldValue("rsvpRequired", data.rsvp_required);
		form.setFieldValue("neverExpires", data.rsvp_expires_in_hours === null);
		form.setFieldValue("rsvpExpiresInHours", data.rsvp_expires_in_hours ?? 72);
		form.setFieldValue("reviewSlaHours", data.review_sla_hours);
		form.setFieldValue(
			"notifyByDate",
			data.notify_by_date ? new Date(data.notify_by_date) : null,
		);
		hasInitialized.current = data.id;
	}, [data, form]);

	if (isLoading) {
		return (
			<LoadingState
				title="Loading delegate approval settings..."
				description="Please wait while we fetch current settings."
			/>
		);
	}

	if (error) {
		return (
			<div className="text-destructive">Failed to load settings.</div>
		);
	}

	return (
		<section className="h-full w-full px-0 pb-8 md:px-6">
			<form
				id={formId}
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					form.handleSubmit();
				}}
				className="flex h-full w-full flex-col"
			>
				<FieldGroup className="flex-1 gap-6 md:gap-8">
					<form.Subscribe
						selector={(state) => ({
							enabled: state.values.enabled,
							rsvpRequired: state.values.rsvpRequired,
							neverExpires: state.values.neverExpires,
						})}
					>
						{(values) => (
							<>
								<FormGroupContainer
									title={{
										icon: CalendarClock,
										label: "Delegate Approval Workflow",
										description:
											"Control application review flow and acknowledgement email timeline for this registration form.",
									}}
								>
									<div className="grid grid-cols-1 gap-4">
										<form.Field name="enabled">
											{(field) => (
												<SwitchCardInput
													label="Enable delegate approval"
													description="New registrations from this form enter pending review before they are accepted."
													checked={field.state.value}
													onCheckedChange={(value) => field.handleChange(Boolean(value))}
													onBlur={field.handleBlur}
													disabled={mutation.isPending}
													variant="no-rounded"
												/>
											)}
										</form.Field>

										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<form.Field name="reviewSlaHours">
												{(field) => (
													<NumberInputLabel
														label="Application review target (hours)"
														value={field.state.value}
														onChange={field.handleChange}
														disabled={mutation.isPending || !values.enabled}
														min={1}
														description="Shown in acknowledgement email (example: 48 hours)."
													/>
												)}
											</form.Field>

											<form.Field name="notifyByDate">
												{(field) => (
													<DateTimePickerField
														label="Decision notice date (optional)"
														value={field.state.value ?? undefined}
														onChange={(value) => field.handleChange(value ?? null)}
														disabled={mutation.isPending || !values.enabled}
														placeholder="Optional"
													/>
												)}
											</form.Field>
										</div>
									</div>
								</FormGroupContainer>

								<FormGroupContainer
									title={{
										icon: CalendarClock,
										label: "RSVP Confirmation",
										description:
											"Configure whether approved delegates must confirm attendance before ticket QR is issued.",
									}}
								>
									<div className="grid grid-cols-1 gap-4">
										<form.Field name="rsvpRequired">
											{(field) => (
												<SwitchCardInput
													label="Require RSVP confirmation"
													description="If on, approved delegates must confirm RSVP before getting QR ticket."
													checked={field.state.value}
													onCheckedChange={(value) => field.handleChange(Boolean(value))}
													onBlur={field.handleBlur}
													disabled={mutation.isPending || !values.enabled}
													variant="no-rounded"
												/>
											)}
										</form.Field>

										<form.Field name="neverExpires">
											{(field) => (
												<SwitchCardInput
													label="RSVP link never expires"
													description="Turn off to set RSVP link expiry in hours."
													checked={field.state.value}
													onCheckedChange={(value) => field.handleChange(Boolean(value))}
													onBlur={field.handleBlur}
													disabled={mutation.isPending || !values.enabled || !values.rsvpRequired}
													variant="no-rounded"
												/>
											)}
										</form.Field>

										{!values.neverExpires && (
											<form.Field name="rsvpExpiresInHours">
												{(field) => (
													<NumberInputLabel
														label="RSVP expiry (hours)"
														value={field.state.value}
														onChange={field.handleChange}
														disabled={mutation.isPending || !values.enabled || !values.rsvpRequired}
														min={1}
														description="How long approved delegates can use the RSVP link."
													/>
												)}
											</form.Field>
										)}
									</div>
								</FormGroupContainer>
							</>
						)}
					</form.Subscribe>
				</FieldGroup>

				<div className="mt-6 flex w-full justify-end">
					<Button type="submit" className="rounded-none" disabled={mutation.isPending}>
						{mutation.isPending ? "Saving..." : "Save Settings"}
					</Button>
				</div>
			</form>
		</section>
	);
}
