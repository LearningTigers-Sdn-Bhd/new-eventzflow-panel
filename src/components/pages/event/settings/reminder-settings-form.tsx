"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BellRing } from "lucide-react";
import * as React from "react";
import { useId } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { getEventById, updateEvent } from "@/lib/api/event";
import type { UpdateEventRequest } from "@/lib/api/event/request";
import { cn } from "@/lib/utils";
import { queryClient } from "@/utils/rest-api";

interface ReminderSettingsFormProps {
	eventId: number;
	onClose?: () => void;
}

interface ToggleRowProps {
	title: string;
	description: string;
	checked: boolean;
	disabled?: boolean;
	onCheckedChange: (checked: boolean) => void;
}

function ToggleRow({
	title,
	description,
	checked,
	disabled,
	onCheckedChange,
}: ToggleRowProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-between gap-4 border p-4",
				disabled && "opacity-50",
			)}
		>
			<div className="flex flex-col gap-1">
				<span className="font-medium text-sm">{title}</span>
				<span className="text-muted-foreground text-xs">{description}</span>
			</div>
			<Switch
				checked={checked}
				disabled={disabled}
				onCheckedChange={onCheckedChange}
			/>
		</div>
	);
}

export default function ReminderSettingsForm({
	eventId,
	onClose,
}: ReminderSettingsFormProps) {
	const formId = useId();
	const sectionId = useId();

	const {
		data: event,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId.toString()),
	});

	const updateEventMutation = useMutation({
		mutationFn: async (payload: { data: UpdateEventRequest }) => {
			return await updateEvent(eventId.toString(), payload.data);
		},
		onSuccess: () => {
			toast.success("Reminder settings updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["event", eventId] });
			queryClient.invalidateQueries({ queryKey: ["events"] });
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update reminder settings");
		},
	});

	const form = useForm({
		defaultValues: {
			remindersEnabled: true,
			reminder7Day: true,
			reminder1Day: true,
		},
		onSubmit: async ({ value }) => {
			await updateEventMutation.mutateAsync({
				data: {
					reminders_enabled: value.remindersEnabled,
					reminder_7_day: value.reminder7Day,
					reminder_1_day: value.reminder1Day,
				},
			});
		},
	});

	const hasInitialized = React.useRef<number | null>(null);
	React.useEffect(() => {
		if (event && hasInitialized.current !== event.id) {
			setTimeout(() => {
				form.setFieldValue("remindersEnabled", event.reminders_enabled ?? true);
				form.setFieldValue("reminder7Day", event.reminder_7_day ?? true);
				form.setFieldValue("reminder1Day", event.reminder_1_day ?? true);
			}, 0);
			hasInitialized.current = event.id;
		}
	}, [event, form]);

	if (isLoading || !event) {
		return (
			<LoadingState
				title="Loading reminder settings..."
				description="Please wait while we fetch the reminder settings"
			/>
		);
	}

	if (error) {
		return (
			<div className="text-destructive">
				Failed to load reminder settings. Please try again.
			</div>
		);
	}

	return (
		<section id={sectionId} className="h-full w-full px-0 pb-8 md:px-6">
			<form
				id={formId}
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="flex h-full w-full flex-col"
			>
				<FieldGroup className="flex-1 gap-6 md:gap-8">
					<FormGroupContainer
						title={{
							icon: BellRing,
							label: "Event Reminders",
							description:
								"Automatically email registered ticket holders before the event starts. Reminders include the attendee's QR code entry pass.",
						}}
					>
						<form.Field name="remindersEnabled">
							{(field) => (
								<ToggleRow
									title="Enable reminders"
									description="Master switch. When off, no reminder emails are sent regardless of the schedule below."
									checked={field.state.value}
									disabled={updateEventMutation.isPending}
									onCheckedChange={field.handleChange}
								/>
							)}
						</form.Field>

						<form.Subscribe selector={(state) => state.values.remindersEnabled}>
							{(remindersEnabled) => (
								<>
									<form.Field name="reminder7Day">
										{(field) => (
											<ToggleRow
												title="7 days before"
												description="Send a reminder one week before the event start date."
												checked={field.state.value}
												disabled={
													!remindersEnabled || updateEventMutation.isPending
												}
												onCheckedChange={field.handleChange}
											/>
										)}
									</form.Field>

									<form.Field name="reminder1Day">
										{(field) => (
											<ToggleRow
												title="1 day before"
												description="Send a final reminder the day before the event start date."
												checked={field.state.value}
												disabled={
													!remindersEnabled || updateEventMutation.isPending
												}
												onCheckedChange={field.handleChange}
											/>
										)}
									</form.Field>
								</>
							)}
						</form.Subscribe>
					</FormGroupContainer>
				</FieldGroup>
				<FieldGroup className="flex flex-col justify-end gap-2 pt-4 md:pt-8 lg:flex-row">
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button
								type="submit"
								disabled={!canSubmit || updateEventMutation.isPending}
								className="w-full rounded-none py-6 lg:w-auto lg:py-0"
							>
								{updateEventMutation.isPending || isSubmitting
									? "Saving..."
									: "Save Changes"}
							</Button>
						)}
					</form.Subscribe>
				</FieldGroup>
			</form>
		</section>
	);
}
