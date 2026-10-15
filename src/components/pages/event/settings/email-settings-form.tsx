"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Handshake, Heart, Mail } from "lucide-react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/auth/use-auth";
import { getEventById, updateEvent } from "@/lib/api/event";
import type { UpdateEventRequest } from "@/lib/api/event/request";
import { getEventTicketTypes } from "@/lib/api/ticket-type";
import { queryClient } from "@/utils/rest-api";
import { canConfigureEmailToggles } from "./access";
import { EMAIL_CATEGORIES, EMAIL_CATEGORY_GROUPS } from "./email-categories";

const BUSINESS_MATCHING_CATEGORY_KEY = "business_matching_invite";
const THANK_YOU_CATEGORY_KEY = "thank_you";
const THANK_YOU_DELAY_OPTIONS = [
	{ value: 0, label: "As soon as the event ends" },
	{ value: 30, label: "30 minutes after" },
	{ value: 60, label: "1 hour after" },
	{ value: 120, label: "2 hours after (default)" },
	{ value: 240, label: "4 hours after" },
	{ value: 1440, label: "Next day (24 hours after)" },
];
// Categories with their own dedicated section below, hidden from the generic grid.
const DEDICATED_CATEGORY_KEYS = [
	BUSINESS_MATCHING_CATEGORY_KEY,
	THANK_YOU_CATEGORY_KEY,
];

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
	businessMatchingSenderName: z.string(),
	businessMatchingHostLabel: z.string(),
	businessMatchingHostInviteSubject: z.string(),
	businessMatchingHostInviteMessage: z.string(),
	emailsEnabled: z.boolean(),
	disabledCategories: z.array(z.string()),
	businessMatchingTicketTypeIds: z.array(z.string()),
	thankYouIncludeFeedback: z.boolean(),
	thankYouDelayMinutes: z.number(),
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
			businessMatchingSenderName: "",
			businessMatchingHostLabel: "",
			businessMatchingHostInviteSubject: "",
			businessMatchingHostInviteMessage: "",
			emailsEnabled: true,
			disabledCategories: [] as string[],
			businessMatchingTicketTypeIds: [] as string[],
			thankYouIncludeFeedback: false,
			thankYouDelayMinutes: 120,
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
						business_matching_sender_name:
							value.businessMatchingSenderName || "",
						business_matching_host_label:
							value.businessMatchingHostLabel || "",
						business_matching_host_invite_subject:
							value.businessMatchingHostInviteSubject || "",
						business_matching_host_invite_message:
							value.businessMatchingHostInviteMessage || "",
						...(canToggleEmails
							? {
									emails_enabled: value.emailsEnabled,
									disabled_categories: value.disabledCategories,
									business_matching_ticket_type_ids:
										value.businessMatchingTicketTypeIds.map(Number),
									thank_you_include_feedback: value.thankYouIncludeFeedback,
									thank_you_delay_minutes: value.thankYouDelayMinutes,
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
				form.setFieldValue(
					"businessMatchingSenderName",
					setting?.business_matching_sender_name || "",
				);
				form.setFieldValue(
					"businessMatchingHostLabel",
					setting?.business_matching_host_label || "",
				);
				form.setFieldValue(
					"businessMatchingHostInviteSubject",
					setting?.business_matching_host_invite_subject || "",
				);
				form.setFieldValue(
					"businessMatchingHostInviteMessage",
					setting?.business_matching_host_invite_message || "",
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
				form.setFieldValue(
					"thankYouIncludeFeedback",
					setting?.thank_you_include_feedback ?? false,
				);
				form.setFieldValue(
					"thankYouDelayMinutes",
					setting?.thank_you_delay_minutes ?? 120,
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

					<FormGroupContainer
						title={{
							icon: Handshake,
							label: "Business Matching Email Customization",
							description:
								"Customize sender display name and host invitation content specifically for Business Matching. Other event emails (tickets, registration, reminders) will remain unaffected.",
						}}
					>
						<div className="grid grid-cols-1 gap-4">
							<form.Field name="businessMatchingSenderName">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Business Matching Sender Name"
											htmlFor={field.name}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="e.g. Event Secretariat B2B"
											disabled={updateEventMutation.isPending}
											description="Sender display name used only for Business Matching emails. Defaults to standard Sender Name above or event title if empty."
										/>
									);
								}}
							</form.Field>

							<form.Field name="businessMatchingHostLabel">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Host Role Term / Label"
											htmlFor={field.name}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="e.g. Business Partner, Business Host"
											disabled={updateEventMutation.isPending}
											description="Custom term for host in invitation emails (e.g. 'Business Partner', 'Speaker', 'Exhibitor'). Defaults to 'Business Host'."
										/>
									);
								}}
							</form.Field>

							<form.Field name="businessMatchingHostInviteSubject">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Host Invitation Subject"
											htmlFor={field.name}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="e.g. You've been invited as a {{host_label}} for {{event_name}}"
											disabled={updateEventMutation.isPending}
											description="Subject line for host invitations. Variables: {{event_name}}, {{session_title}}, {{inviter_name}}, {{host_label}}."
										/>
									);
								}}
							</form.Field>

							<form.Field name="businessMatchingHostInviteMessage">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											type="textarea"
											label="Host Invitation Message Body / Instructions"
											htmlFor={field.name}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="e.g. As a Business Host, you can set up your profile, manage your schedule, and connect with attendees during business matching sessions."
											disabled={updateEventMutation.isPending}
											description="Custom message body for host invitations. If empty, the default intro is used. Variables: {{event_name}}, {{session_title}}, {{inviter_name}}, {{invite_url}}."
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
															!DEDICATED_CATEGORY_KEYS.includes(c.key),
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
								icon: Heart,
								label: "Post-Event Thank You",
								description:
									"Automatically thank checked-in attendees about 2 hours after the event ends. One email per address.",
							}}
						>
							<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
								<form.Field name="emailsEnabled">
									{(emailsEnabledField) => (
										<form.Field name="disabledCategories">
											{(field) => (
												<SwitchCardInput
													variant="no-rounded"
													label="Send thank you email"
													htmlFor={`${field.name}-${THANK_YOU_CATEGORY_KEY}`}
													checked={
														!field.state.value.includes(THANK_YOU_CATEGORY_KEY)
													}
													onCheckedChange={(checked) => {
														field.handleChange(
															checked
																? field.state.value.filter(
																		(k) => k !== THANK_YOU_CATEGORY_KEY,
																	)
																: [
																		...field.state.value,
																		THANK_YOU_CATEGORY_KEY,
																	],
														);
													}}
													disabled={
														updateEventMutation.isPending ||
														!emailsEnabledField.state.value
													}
													description="A warm thank-you note sent once, only to attendees who checked in."
												/>
											)}
										</form.Field>
									)}
								</form.Field>
								<form.Field name="disabledCategories">
									{(categoriesField) => (
										<form.Field name="thankYouIncludeFeedback">
											{(field) => (
												<SwitchCardInput
													variant="no-rounded"
													label="Include feedback form link"
													htmlFor={field.name}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={
														updateEventMutation.isPending ||
														categoriesField.state.value.includes(
															THANK_YOU_CATEGORY_KEY,
														)
													}
													description="Adds a “Share Your Feedback” button. Skipped automatically if the feedback form is inactive."
												/>
											)}
										</form.Field>
									)}
								</form.Field>
								<form.Field name="disabledCategories">
									{(categoriesField) => (
										<form.Field name="thankYouDelayMinutes">
											{(field) => (
												<div className="space-y-2 border border-slate-200 p-4">
													<Label htmlFor={field.name}>Send timing</Label>
													<Select
														value={String(field.state.value)}
														onValueChange={(v) => field.handleChange(Number(v))}
														disabled={
															updateEventMutation.isPending ||
															categoriesField.state.value.includes(
																THANK_YOU_CATEGORY_KEY,
															)
														}
													>
														<SelectTrigger
															id={field.name}
															className="w-full rounded-none"
														>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{THANK_YOU_DELAY_OPTIONS.map((o) => (
																<SelectItem
																	key={o.value}
																	value={String(o.value)}
																>
																	{o.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<p className="text-muted-foreground text-xs">
														Attendees who check in after the email is sent won't
														receive it. Checked about every 10 minutes.
													</p>
												</div>
											)}
										</form.Field>
									)}
								</form.Field>
							</div>
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
