"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import * as z from "zod";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/auth/use-auth";
import { getEventById, updateEvent } from "@/lib/api/event";
import type { UpdateEventRequest } from "@/lib/api/event/request";
import type { ScanMode } from "@/lib/api/event/response";
import { queryClient } from "@/utils/rest-api";
import {
	canConfigureAdvancedEventOptions,
	canConfigureExhibitorKit,
} from "./access";

const SCAN_MODE_OPTIONS: Array<{
	value: ScanMode;
	label: string;
	description: string;
}> = [
	{
		value: "unlimited",
		label: "Unlimited",
		description: "Scan anytime, any number of times. Good for re-entry.",
	},
	{
		value: "per_location",
		label: "Once per location",
		description: "Each entrance or zone counts once, and resets each day.",
	},
	{
		value: "per_day",
		label: "Once per day",
		description: "Each badge can be scanned once per calendar day.",
	},
];

const featuresFormSchema = z.object({
	multipleScans: z.boolean(),
	multipleScanMode: z.enum(["unlimited", "per_location", "per_day"]),
	allowMultipleTicketsPerEmail: z.boolean(),
	requireUniqueMembershipNumbers: z.boolean(),
	useBusinessMatching: z.boolean(),
	businessMatchingLinkedExhibitorEnabled: z.boolean(),
	useVoucher: z.boolean(),
	useSponsorship: z.boolean(),
	useEventLeads: z.boolean(),
	useCertificate: z.boolean(),
	useFeedback: z.boolean(),
	useApiAccess: z.boolean(),
	vehiclesEnabled: z.boolean(),
	useExhibitorKit: z.boolean(),
	enableExhibitorManagement: z.boolean(),
	allowPrintingServices: z.boolean(),
});

interface EventFeaturesFormProps {
	eventId: number;
	onClose?: () => void;
}

export default function EventFeaturesForm({
	eventId,
	onClose,
}: EventFeaturesFormProps) {
	const { user } = useAuth();
	const canManageAdvancedEventOptions = canConfigureAdvancedEventOptions(
		user?.role,
	);
	const canManageExhibitorKit = canConfigureExhibitorKit(user?.role);

	const {
		data: event,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId.toString()),
	});

	const updateEventMutation = useMutation({
		mutationFn: async (payload: { id: number; data: UpdateEventRequest }) => {
			return await updateEvent(eventId.toString(), payload.data);
		},
		onSuccess: () => {
			toast.success("Event features updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["event", eventId] });
			queryClient.invalidateQueries({ queryKey: ["events"] });
			onClose?.();
		},
		onError: (err: Error) => {
			toast.error(err.message || "Failed to update event features");
		},
	});

	const form = useForm({
		defaultValues: {
			multipleScans: false,
			multipleScanMode: "unlimited" as ScanMode,
			allowMultipleTicketsPerEmail: false,
			requireUniqueMembershipNumbers: true,
			useBusinessMatching: false,
			businessMatchingLinkedExhibitorEnabled: false,
			useVoucher: true,
			useSponsorship: false,
			useEventLeads: false,
			useCertificate: false,
			useFeedback: false,
			useApiAccess: false,
			vehiclesEnabled: false,
			useExhibitorKit: false,
			enableExhibitorManagement: false,
			allowPrintingServices: false,
		},
		validators: {
			onSubmit: featuresFormSchema,
		},
		onSubmit: async ({ value }) => {
			await updateEventMutation.mutateAsync({
				id: eventId,
				data: {
					multiple_scans: value.multipleScans,
					multiple_scan_mode: value.multipleScanMode,
					allow_multiple_tickets_per_email: value.allowMultipleTicketsPerEmail,
					require_unique_membership_numbers:
						value.requireUniqueMembershipNumbers,
					use_business_matching: value.useBusinessMatching,
					business_matching_linked_exhibitor_enabled:
						value.businessMatchingLinkedExhibitorEnabled,
					use_voucher: value.useVoucher,
					use_sponsorship: value.useSponsorship,
					use_event_leads: value.useEventLeads,
					use_certificate: value.useCertificate,
					use_feedback: value.useFeedback,
					use_api_access: value.useApiAccess,
					vehicles_enabled: value.vehiclesEnabled,
					use_exhibitor_kit: value.useExhibitorKit,
					enable_exhibitor_management: value.enableExhibitorManagement,
					allow_contractor_printing_services: value.allowPrintingServices,
				},
			});
		},
	});

	React.useEffect(() => {
		if (event) {
			form.setFieldValue("multipleScans", event.multiple_scans || false);
			form.setFieldValue(
				"multipleScanMode",
				(event.multiple_scan_mode as ScanMode) || "unlimited",
			);
			form.setFieldValue(
				"allowMultipleTicketsPerEmail",
				event.allow_multiple_tickets_per_email || false,
			);
			form.setFieldValue(
				"requireUniqueMembershipNumbers",
				event.require_unique_membership_numbers ?? true,
			);
			form.setFieldValue(
				"useBusinessMatching",
				event.use_business_matching ?? false,
			);
			form.setFieldValue(
				"businessMatchingLinkedExhibitorEnabled",
				event.business_matching_linked_exhibitor_enabled ?? false,
			);
			form.setFieldValue("useVoucher", event.use_voucher ?? true);
			form.setFieldValue("useSponsorship", event.use_sponsorship ?? false);
			form.setFieldValue("useEventLeads", event.use_event_leads ?? false);
			form.setFieldValue("useCertificate", event.use_certificate ?? false);
			form.setFieldValue("useFeedback", event.use_feedback ?? false);
			form.setFieldValue("useApiAccess", event.use_api_access ?? false);
			form.setFieldValue("vehiclesEnabled", event.vehicles_enabled ?? false);
			form.setFieldValue("useExhibitorKit", event.use_exhibitor_kit ?? false);
			form.setFieldValue(
				"enableExhibitorManagement",
				event.enable_exhibitor_management ?? false,
			);
			form.setFieldValue(
				"allowPrintingServices",
				event.allow_contractor_printing_services ?? false,
			);
		}
	}, [event, form]);

	if (isLoading) {
		return (
			<LoadingState
				title="Loading Event Features..."
				description="Please wait while we load the event options."
			/>
		);
	}

	if (error) {
		return (
			<div className="flex h-full w-full items-center justify-center p-8">
				<p className="text-destructive text-sm">
					Failed to load event features. Please try again.
				</p>
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col">
			<form
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
							icon: SlidersHorizontal,
							label: "Event Features & Option Flags",
							description:
								"Toggle features and operational rules on or off for this event.",
						}}
					>
						<div className="flex flex-col gap-6">
							{/* Section 1: Attendance & Ticketing Controls */}
							<div className="space-y-4">
								<FieldContent className="flex w-full flex-none flex-col gap-1">
									<FieldLabel>Attendance & Check-in Rules</FieldLabel>
									<FieldDescription className="text-balance">
										Control scan policies and ticket allocation limits.
									</FieldDescription>
								</FieldContent>

								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<form.Field name="multipleScans">
										{(field) => (
											<div className="flex flex-col gap-0 md:col-span-2">
												<SwitchCardInput
													label="Multiple Scans"
													description="Allow tickets or visitors to be scanned multiple times during the event."
													htmlFor={field.name}
													variant="no-rounded"
													border={true}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={updateEventMutation.isPending}
												/>
												{field.state.value && (
													<form.Field name="multipleScanMode">
														{(modeField) => (
															<RadioGroup
																value={modeField.state.value}
																onValueChange={(v) =>
																	modeField.handleChange(v as ScanMode)
																}
																disabled={updateEventMutation.isPending}
																className="flex flex-col gap-4 border border-t-0 p-4"
															>
																{SCAN_MODE_OPTIONS.map((option) => (
																	<div
																		key={option.value}
																		className="flex items-start gap-3"
																	>
																		<RadioGroupItem
																			value={option.value}
																			id={`scan-mode-${option.value}`}
																			className="mt-1"
																		/>
																		<Label
																			htmlFor={`scan-mode-${option.value}`}
																			className="flex flex-col items-start gap-1 font-normal"
																		>
																			<span className="font-medium">
																				{option.label}
																			</span>
																			<span className="text-muted-foreground text-sm">
																				{option.description}
																			</span>
																		</Label>
																	</div>
																))}
															</RadioGroup>
														)}
													</form.Field>
												)}
											</div>
										)}
									</form.Field>

									<form.Field name="requireUniqueMembershipNumbers">
										{(field) => (
											<SwitchCardInput
												label="Require Unique Membership Numbers"
												description="Turn off to let multiple people register with the same membership number."
												htmlFor={field.name}
												variant="no-rounded"
												border={true}
												checked={field.state.value}
												onCheckedChange={field.handleChange}
												disabled={updateEventMutation.isPending}
											/>
										)}
									</form.Field>

									<form.Field name="allowMultipleTicketsPerEmail">
										{(field) => (
											<SwitchCardInput
												label="Allow Multiple Tickets per Email"
												description="Allow one person or email to hold more than one ticket for this event."
												htmlFor={field.name}
												variant="no-rounded"
												border={true}
												checked={field.state.value}
												onCheckedChange={field.handleChange}
												disabled={updateEventMutation.isPending}
											/>
										)}
									</form.Field>
								</div>
							</div>

							{/* Section 2: Modules & Add-ons */}
							{canManageAdvancedEventOptions && (
								<div className="space-y-4 border-t pt-6">
									<FieldContent className="flex w-full flex-none flex-col gap-1">
										<FieldLabel>Event Modules & Integrations</FieldLabel>
										<FieldDescription className="text-balance">
											Enable specialized workflows, surveys, certificates, and marketing tools.
										</FieldDescription>
									</FieldContent>

									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<form.Field name="useFeedback">
											{(field) => (
												<SwitchCardInput
													label="Feedback Form"
													description="Create post-event feedback forms and collect attendee responses."
													htmlFor={field.name}
													variant="no-rounded"
													border={true}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={updateEventMutation.isPending}
												/>
											)}
										</form.Field>

										<form.Field name="useCertificate">
											{(field) => (
												<SwitchCardInput
													label="E-Certificates"
													description="Design certificate templates and email them to attendees."
													htmlFor={field.name}
													variant="no-rounded"
													border={true}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={updateEventMutation.isPending}
												/>
											)}
										</form.Field>

										<form.Field name="useVoucher">
											{(field) => (
												<SwitchCardInput
													label="Vouchers"
													description="Allow vouchers for this event."
													htmlFor={field.name}
													variant="no-rounded"
													border={true}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={updateEventMutation.isPending}
												/>
											)}
										</form.Field>

										<form.Field name="useSponsorship">
											{(field) => (
												<SwitchCardInput
													label="Sponsorships"
													description="Allow sponsorships for this event."
													htmlFor={field.name}
													variant="no-rounded"
													border={true}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={updateEventMutation.isPending}
												/>
											)}
										</form.Field>

										<form.Field name="useEventLeads">
											{(field) => (
												<SwitchCardInput
													label="Event Leads"
													description="Allow event leads collection for this event."
													htmlFor={field.name}
													variant="no-rounded"
													border={true}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={updateEventMutation.isPending}
												/>
											)}
										</form.Field>

										<form.Field name="useApiAccess">
											{(field) => (
												<SwitchCardInput
													label="API Access"
													description="Allow API keys to be scoped to this event for external integrations."
													htmlFor={field.name}
													variant="no-rounded"
													border={true}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={updateEventMutation.isPending}
												/>
											)}
										</form.Field>

										<form.Field name="vehiclesEnabled">
											{(field) => (
												<SwitchCardInput
													label="Vehicles"
													description="Allow vehicle registration for this event."
													htmlFor={field.name}
													variant="no-rounded"
													border={true}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={updateEventMutation.isPending}
												/>
											)}
										</form.Field>

										<form.Field name="useBusinessMatching">
											{(field) => (
												<div className="flex flex-col gap-4">
													<SwitchCardInput
														label="Business Matching"
														description="Allow business matching for this event."
														htmlFor={field.name}
														variant="no-rounded"
														border={true}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														disabled={updateEventMutation.isPending}
													/>

													{field.state.value && (
														<form.Field name="businessMatchingLinkedExhibitorEnabled">
															{(linkedField) => (
																<SwitchCardInput
																	label="Linked Exhibitor Host"
																	description="Require business matching hosts to be linked to an approved exhibitor registration."
																	htmlFor={linkedField.name}
																	variant="no-rounded"
																	border={true}
																	checked={linkedField.state.value}
																	onCheckedChange={linkedField.handleChange}
																	disabled={updateEventMutation.isPending}
																/>
															)}
														</form.Field>
													)}
												</div>
											)}
										</form.Field>
									</div>
								</div>
							)}

							{/* Section 3: Exhibitor Kit */}
							{canManageExhibitorKit && (
								<div className="space-y-4 border-t pt-6">
									<FieldContent className="flex w-full flex-none flex-col gap-1">
										<FieldLabel>Exhibitor Kit</FieldLabel>
										<FieldDescription className="text-balance">
											Enable exhibitor contractor kits and booth management.
										</FieldDescription>
									</FieldContent>

									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<form.Field name="useExhibitorKit">
											{(exhibitorKitField) => {
												const useExhibitorKitValue =
													exhibitorKitField.state.value;

												return (
													<>
														<SwitchCardInput
															label="Enable Exhibitor Kit"
															description="Allow exhibitor contractors to manage kits for exhibitors under their contractorships."
															htmlFor={exhibitorKitField.name}
															variant="no-rounded"
															border={true}
															checked={exhibitorKitField.state.value}
															onCheckedChange={(checked) => {
																exhibitorKitField.handleChange(checked);
																if (!checked) {
																	form.setFieldValue(
																		"enableExhibitorManagement",
																		false,
																	);
																	form.setFieldValue(
																		"allowPrintingServices",
																		false,
																	);
																}
															}}
															disabled={updateEventMutation.isPending}
														/>

														{useExhibitorKitValue && (
															<>
																<form.Field name="enableExhibitorManagement">
																	{(field) => (
																		<SwitchCardInput
																			label="Enable Exhibitor Management"
																			description="Allow exhibitors and contractors to access exhibitor management features for this event."
																			htmlFor={field.name}
																			variant="no-rounded"
																			border={true}
																			checked={field.state.value}
																			onCheckedChange={(checked) => {
																				field.handleChange(checked);
																				if (!checked) {
																					form.setFieldValue(
																						"allowPrintingServices",
																						false,
																					);
																				}
																			}}
																			disabled={updateEventMutation.isPending}
																		/>
																	)}
																</form.Field>

																<form.Subscribe
																	selector={(state) =>
																		state.values.enableExhibitorManagement
																	}
																>
																	{(enableExhibitorManagement) =>
																		enableExhibitorManagement ? (
																			<form.Field name="allowPrintingServices">
																				{(field) => (
																					<SwitchCardInput
																						label="Allow Contractor Printing Services"
																						description="Allow exhibition contractors to access the printing services tab for this event."
																						htmlFor={field.name}
																						variant="no-rounded"
																						border={true}
																						checked={field.state.value}
																						onCheckedChange={field.handleChange}
																						disabled={
																							updateEventMutation.isPending
																						}
																					/>
																				)}
																			</form.Field>
																		) : null
																	}
																</form.Subscribe>
															</>
														)}
													</>
												);
											}}
										</form.Field>
									</div>
								</div>
							)}
						</div>
					</FormGroupContainer>
				</FieldGroup>

				{/* Form Actions */}
				<div className="sticky bottom-0 mt-6 flex justify-end gap-3 border-t bg-background pt-4 pb-2">
					{onClose && (
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={updateEventMutation.isPending}
							className="rounded-none"
						>
							Cancel
						</Button>
					)}
					<Button
						type="submit"
						disabled={updateEventMutation.isPending}
						className="rounded-none"
					>
						{updateEventMutation.isPending
							? "Saving changes..."
							: "Save Changes"}
					</Button>
				</div>
			</form>
		</div>
	);
}
