"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Handshake, Mail } from "lucide-react";
import * as React from "react";
import { useId } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { MultiSelectLegacy } from "@/components/ui/multi-select";
import { useAuth } from "@/hooks/auth/use-auth";
import { getEventById, updateEvent } from "@/lib/api/event";
import type { UpdateEventRequest } from "@/lib/api/event/request";
import { getEventTicketTypes } from "@/lib/api/ticket-type";
import { queryClient } from "@/utils/rest-api";
import { canConfigureEmailToggles } from "./access";
import { EMAIL_CATEGORIES, EMAIL_CATEGORY_GROUPS } from "./email-categories";

const BUSINESS_MATCHING_CATEGORY_KEY = "business_matching_invite";

const formSchema = z.object({
	senderName: z.string(),
	senderAddress: z
		.string()
		.refine((val) => val === "" || z.string().email().safeParse(val).success, {
			message: "Please enter a valid email address",
		}),
	contactEmail: z
		.string()
		.refine((val) => val === "" || z.string().email().safeParse(val).success, {
			message: "Please enter a valid email address",
		}),
	paymentReceiptEmail: z
		.string()
		.refine((val) => val === "" || z.string().email().safeParse(val).success, {
			message: "Please enter a valid email address",
		}),
	emailsEnabled: z.boolean(),
	disabledCategories: z.array(z.string()),
	businessMatchingTicketTypeIds: z.array(z.string()),
});

interface EmailSettingsFormProps {
	eventId: number;
	onClose?: () => void;
}

export default function EmailSettingsForm({
	eventId,
	onClose,
}: EmailSettingsFormProps) {
	const formId = useId();
	const sectionId = useId();
	const { user } = useAuth();
	const canToggleEmails = canConfigureEmailToggles(user?.role);

	const {
		data: event,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId.toString()),
	});

	const { data: ticketTypes } = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId: eventId.toString() }),
	});

	const updateEventMutation = useMutation({
		mutationFn: async (payload: { id: number; data: UpdateEventRequest }) => {
			return await updateEvent(eventId.toString(), payload.data);
		},
		onSuccess: () => {
			toast.success("Email settings updated successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId],
			});
			queryClient.invalidateQueries({
				queryKey: ["events"],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update email settings");
		},
	});

	const form = useForm({
		defaultValues: {
			senderName: "",
			senderAddress: "",
			contactEmail: "",
			paymentReceiptEmail: "",
			emailsEnabled: true,
			disabledCategories: [] as string[],
			businessMatchingTicketTypeIds: [] as string[],
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await updateEventMutation.mutateAsync({
				id: eventId,
				data: {
					event_email_setting_attributes: {
						sender_name: value.senderName || "",
						sender_address: value.senderAddress || "",
						contact_email: value.contactEmail || "",
						payment_receipt_email: value.paymentReceiptEmail || "",
						...(canToggleEmails
							? {
									emails_enabled: value.emailsEnabled,
									disabled_categories: value.disabledCategories,
									business_matching_ticket_type_ids:
										value.businessMatchingTicketTypeIds.map(Number),
								}
							: {}),
					},
				},
			});
		},
	});

	const hasInitialized = React.useRef<number | null>(null);
	React.useEffect(() => {
		if (event && hasInitialized.current !== event.id) {
			setTimeout(() => {
				const setting = event.event_email_setting;
				form.setFieldValue("senderName", setting?.sender_name || "");
				form.setFieldValue("senderAddress", setting?.sender_address || "");
				form.setFieldValue("contactEmail", setting?.contact_email || "");
				form.setFieldValue(
					"paymentReceiptEmail",
					setting?.payment_receipt_email || event.payment_receipt_email || "",
				);
				form.setFieldValue("emailsEnabled", setting?.emails_enabled ?? true);
				form.setFieldValue(
					"disabledCategories",
					setting?.disabled_categories ?? [],
				);
				form.setFieldValue(
					"businessMatchingTicketTypeIds",
					(setting?.business_matching_ticket_type_ids ?? []).map(String),
				);
			}, 0);
			hasInitialized.current = event.id;
		}
	}, [event, form]);

	if (isLoading) {
		return (
			<LoadingState
				title="Loading email settings..."
				description="Please wait while we fetch the email settings"
			/>
		);
	}

	if (error) {
		return (
			<div className="text-destructive">
				Failed to load email settings. Please try again.
			</div>
		);
	}

	if (!event) {
		return (
			<LoadingState
				title="Loading email settings..."
				description="Please wait while we fetch the email settings"
			/>
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
							icon: Mail,
							label: "Email Sender",
							description:
								"Configure the sender name and email address for all event emails (registration confirmations, payment receipts, etc.).",
						}}
					>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<form.Field name="senderName">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Sender Name"
											htmlFor={field.name}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="e.g. Event Secretariat"
											disabled={updateEventMutation.isPending}
											description="Display name shown in the From field. Defaults to event title if empty."
										/>
									);
								}}
							</form.Field>

							<form.Field name="senderAddress">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Sender Email Address"
											htmlFor={field.name}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="e.g. noreply@yourdomain.com"
											disabled={updateEventMutation.isPending}
											description="Email address used in the From field. Defaults to system address if empty."
										/>
									);
								}}
							</form.Field>
						</div>
					</FormGroupContainer>

					<FormGroupContainer
						title={{
							icon: Mail,
							label: "Contact & Notifications",
							description:
								"Configure the support contact email shown in emails and the BCC recipient for payment receipts.",
						}}
					>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<form.Field name="contactEmail">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Support Contact Email"
											htmlFor={field.name}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="e.g. support@yourdomain.com"
											disabled={updateEventMutation.isPending}
											description="Shown in emails as the contact for support inquiries. Hidden if empty."
										/>
									);
								}}
							</form.Field>

							<form.Field name="paymentReceiptEmail">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Registration Notification BCC Email"
											htmlFor={field.name}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="e.g. info@yourdomain.com"
											disabled={updateEventMutation.isPending}
											description="Receives a BCC copy of all registration emails. Ensure the email is valid."
										/>
									);
								}}
							</form.Field>
						</div>
					</FormGroupContainer>

					{canToggleEmails && (
						<FormGroupContainer
							title={{
								icon: Mail,
								label: "Email Sending Control",
								description:
									"Turn all event emails on/off, or disable specific email types. Org owner only.",
							}}
						>
							<form.Field name="emailsEnabled">
								{(field) => (
									<SwitchCardInput
										variant="no-rounded"
										label="Send emails for this event"
										htmlFor={field.name}
										checked={field.state.value}
										onCheckedChange={field.handleChange}
										disabled={updateEventMutation.isPending}
										description="Master switch. Turning this off stops every email below, regardless of their state."
									/>
								)}
							</form.Field>

							<form.Field name="emailsEnabled">
								{(emailsEnabledField) => (
									<form.Field name="disabledCategories">
										{(field) => (
											<div className="flex flex-col gap-6">
												{EMAIL_CATEGORY_GROUPS.map((group) => {
													const categories = EMAIL_CATEGORIES.filter(
														(c) =>
															c.group === group.key &&
															c.key !== BUSINESS_MATCHING_CATEGORY_KEY,
													);
													if (categories.length === 0) return null;

													return (
														<div
															key={group.key}
															className="flex flex-col gap-3"
														>
															<span className="font-medium text-muted-foreground text-sm">
																{group.label}
															</span>
															<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
																{categories.map((category) => (
																	<SwitchCardInput
																		key={category.key}
																		variant="no-rounded"
																		label={category.label}
																		htmlFor={`${field.name}-${category.key}`}
																		checked={
																			!field.state.value.includes(category.key)
																		}
																		onCheckedChange={(checked) => {
																			field.handleChange(
																				checked
																					? field.state.value.filter(
																							(k) => k !== category.key,
																						)
																					: [
																							...field.state.value,
																							category.key,
																						],
																			);
																		}}
																		disabled={
																			updateEventMutation.isPending ||
																			!emailsEnabledField.state.value
																		}
																	/>
																))}
															</div>
														</div>
													);
												})}
											</div>
										)}
									</form.Field>
								)}
							</form.Field>
						</FormGroupContainer>
					)}

					{canToggleEmails && (
						<FormGroupContainer
							title={{
								icon: Handshake,
								label: "Business Matching Invite",
								description:
									"Send a follow-up email with the business matching booking link after a ticket is confirmed.",
							}}
						>
							<form.Field name="emailsEnabled">
								{(emailsEnabledField) => (
									<form.Field name="disabledCategories">
										{(field) => (
											<SwitchCardInput
												variant="no-rounded"
												label="Send business matching invite"
												htmlFor={`${field.name}-${BUSINESS_MATCHING_CATEGORY_KEY}`}
												checked={
													!field.state.value.includes(
														BUSINESS_MATCHING_CATEGORY_KEY,
													)
												}
												onCheckedChange={(checked) => {
													field.handleChange(
														checked
															? field.state.value.filter(
																	(k) => k !== BUSINESS_MATCHING_CATEGORY_KEY,
																)
															: [
																	...field.state.value,
																	BUSINESS_MATCHING_CATEGORY_KEY,
																],
													);
												}}
												disabled={
													updateEventMutation.isPending ||
													!emailsEnabledField.state.value
												}
												description="Buyers of the ticket types picked below get this email right after their ticket confirmation."
											/>
										)}
									</form.Field>
								)}
							</form.Field>

							<form.Field name="disabledCategories">
								{(categoriesField) =>
									!categoriesField.state.value.includes(
										BUSINESS_MATCHING_CATEGORY_KEY,
									) && (
										<form.Field name="businessMatchingTicketTypeIds">
											{(ticketTypeIdsField) => (
												<div className="mt-4 flex flex-col gap-2 border-t pt-4">
													<Label className="font-medium text-sm">
														Ticket types that receive the invite
													</Label>
													<MultiSelectLegacy
														options={(ticketTypes ?? []).map((tt) => ({
															label: tt.name,
															value: tt.id.toString(),
														}))}
														selected={ticketTypeIdsField.state.value}
														onChange={ticketTypeIdsField.handleChange}
														placeholder={
															(ticketTypes ?? []).length === 0
																? "No ticket types yet"
																: "Select ticket types"
														}
													/>
													<span className="text-muted-foreground text-xs">
														Only buyers of the selected ticket types get this
														email. Requires business matching to be enabled for
														this event too.
													</span>
												</div>
											)}
										</form.Field>
									)
								}
							</form.Field>
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
									: "Save Changes"}
							</Button>
						)}
					</form.Subscribe>
				</FieldGroup>
			</form>
		</section>
	);
}
