"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InfoIcon, Webhook } from "lucide-react";
import * as React from "react";
import { useId } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { MultiURLInput } from "@/components/admin-ui/form/multi-url-input";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	FieldGroup,
} from "@/components/ui/field";
import { getEventById, updateEvent } from "@/lib/api/event";
import type { UpdateEventRequest } from "@/lib/api/event/request";
import { queryClient } from "@/utils/rest-api";

const formSchema = z.object({
	webhookUrl: z
		.string()
		.refine(
			(val) => {
				if (val === "") return true;
				const urls = val.split(",").map((s) => s.trim());
				return urls.every((url) => z.string().url().safeParse(url).success);
			},
			{
				message: "Please enter valid URLs separated by commas",
			},
		),
	businessMatchingWebhookUrl: z
		.string()
		.refine((val) => val === "" || z.string().url().safeParse(val).success, {
			message: "Please enter a valid URL",
		}),
});

interface WebhookSettingsFormProps {
	eventId: number;
	onClose?: () => void;
}

export default function WebhookSettingsForm({ eventId, onClose }: WebhookSettingsFormProps) {
	const formId = useId();
	const sectionId = useId();

	// Fetch event data
	const {
		data: event,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId.toString()),
	});

	// Update event mutation
	const updateEventMutation = useMutation({
		mutationFn: async (payload: { id: number; data: UpdateEventRequest }) => {
			return await updateEvent(eventId.toString(), payload.data);
		},
		onSuccess: () => {
			toast.success("Webhook settings updated successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update webhook settings");
		},
	});

	const form = useForm({
		defaultValues: {
			webhookUrl: "",
			businessMatchingWebhookUrl: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await updateEventMutation.mutateAsync({
				id: eventId,
				data: {
					webhook_url: value.webhookUrl || "",
					business_matching_webhook_url: value.businessMatchingWebhookUrl || "",
				},
			});
		},
	});

	// Update form fields when event loads
	React.useEffect(() => {
		if (event) {
			form.setFieldValue("webhookUrl", event.webhook_url || "");
			form.setFieldValue("businessMatchingWebhookUrl", event.business_matching_webhook_url || "");
		}
	}, [event, form]);

	if (isLoading) {
		return (
			<LoadingState
				title="Loading webhook settings..."
				description="Please wait while we fetch the event details"
			/>
		);
	}

	if (error) {
		return (
			<div className="text-destructive">
				Failed to load webhook settings. Please try again.
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
							icon: Webhook,
							label: "Webhook Notifications",
							description: "Configure one or more URLs to receive real-time event notifications.",
						}}
					>
						<div className="grid grid-cols-1 gap-4">
							<form.Field name="webhookUrl">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<MultiURLInput
											label="General Webhook URLs"
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="https://example.com/webhook"
											description="These URLs will receive notifications for ticket creation, scans, and other event updates."
											disabled={updateEventMutation.isPending}
										/>
									);
								}}
							</form.Field>
						</div>
					</FormGroupContainer>

					{event?.use_business_matching && (
						<FormGroupContainer
							title={{
								icon: InfoIcon,
								label: "Business Matching Integration",
								description: "Configure the dedicated webhook for external business matching services.",
							}}
						>
							<div className="grid grid-cols-1 gap-4">
								<form.Field name="businessMatchingWebhookUrl">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<InputLabel
												label="Business Matching Webhook URL"
												htmlFor={field.name}
												value={field.state.value}
												onChange={field.handleChange}
												onBlur={field.handleBlur}
												errors={field.state.meta.errors}
												isInvalid={isInvalid}
												placeholder="https://webhook.saleschatalyst.com/..."
												description="Used for synchronous scheduling and availability lookups."
												disabled={updateEventMutation.isPending}
											/>
										);
									}}
								</form.Field>
							</div>
						</FormGroupContainer>
					)}
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
									: "Save Webhook Settings"}
							</Button>
						)}
					</form.Subscribe>
				</FieldGroup>
			</form>
		</section>
	);
}
