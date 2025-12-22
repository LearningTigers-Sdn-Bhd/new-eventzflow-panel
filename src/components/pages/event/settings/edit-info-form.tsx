"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Box, Cog, InfoIcon } from "lucide-react";
import * as React from "react";
import { useId } from "react";
import { toast } from "sonner";
import * as z from "zod";
import DateTimePickerField from "@/components/admin-ui/form/date-time-picker";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { SwitchStateCardInput } from "@/components/admin-ui/form/switch-state-card-input";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { useAuth } from "@/hooks/use-auth";
import { getEventById, updateEvent } from "@/lib/api/event";
import type { UpdateEventRequest } from "@/lib/api/event/request";
import { cn } from "@/lib/utils";
import { queryClient } from "@/utils/rest-api";

const formSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters"),
	status: z.enum(["draft", "published", "cancelled", "completed"]),
	visibility: z.boolean(),
	useTicket: z.boolean(),
	useExhibitorKit: z.boolean(),
	allowPrintingServices: z.boolean(),
	description: z.string(),
	webhookUrl: z
		.string()
		.refine((val) => val === "" || z.string().url().safeParse(val).success, {
			message: "Please enter a valid URL",
		}),
	multipleScans: z.boolean(),
	startDate: z.date(),
	endDate: z.date(),
});

interface InfoFormProps {
	eventId: number;
	onClose?: () => void;
}

export default function InfoForm({ eventId, onClose }: InfoFormProps) {
	const formId = useId();
	const sectionId = useId();
	const { user } = useAuth();

	// Check if user is org_owner
	const isOrgOwner = user?.role === "org_owner";

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
			toast.success("Event information updated successfully!");
			// Invalidate queries to refetch data
			queryClient.invalidateQueries({
				queryKey: ["event", eventId],
			});
			queryClient.invalidateQueries({
				queryKey: ["events"],
			});
			// Close modal on success
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update event");
		},
	});

	const form = useForm({
		defaultValues: {
			title: "",
			status: "draft" as "draft" | "published" | "cancelled" | "completed",
			visibility: true,
			useTicket: true,
			useExhibitorKit: false,
			allowPrintingServices: false,
			description: "",
			webhookUrl: "",
			multipleScans: false,
			startDate: new Date(),
			endDate: new Date(),
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			await updateEventMutation.mutateAsync({
				id: eventId,
				data: {
					title: value.title,
					status: value.status,
					visibility: value.visibility,
					use_ticket: value.useTicket,
					use_exhibitor_kit: value.useExhibitorKit,
					allow_contractor_printing_services: value.allowPrintingServices,
					description: value.description,
					webhook_url: value.webhookUrl || "",
					multiple_scans: value.multipleScans,
					start_date: value.startDate.toISOString(),
					end_date: value.endDate.toISOString(),
				},
			});
		},
	});

	// Update form fields when event loads
	const hasInitialized = React.useRef<number | null>(null);
	React.useEffect(() => {
		if (event && hasInitialized.current !== event.id) {
			// Use setTimeout to ensure form fields are ready before setting values
			setTimeout(() => {
				form.setFieldValue("title", event.title || "");
				form.setFieldValue(
					"status",
					event.status as "draft" | "published" | "cancelled" | "completed",
				);
				form.setFieldValue("visibility", event.visibility ?? true);
				form.setFieldValue("useTicket", event.use_ticket ?? true);
				form.setFieldValue("useExhibitorKit", event.use_exhibitor_kit ?? false);
				form.setFieldValue(
					"allowPrintingServices",
					event.allow_contractor_printing_services ?? false,
				);
				form.setFieldValue("description", event.description || "");
				form.setFieldValue("webhookUrl", event.webhook_url || "");
				form.setFieldValue("multipleScans", event.multiple_scans || false);
				form.setFieldValue(
					"startDate",
					event.start_date ? new Date(event.start_date) : new Date(),
				);
				form.setFieldValue(
					"endDate",
					event.end_date ? new Date(event.end_date) : new Date(),
				);
			}, 0);
			hasInitialized.current = event.id;
		}
	}, [event, form]);
	if (isLoading) {
		return (
			<LoadingState
				title="Loading event information..."
				description="Please wait while we fetch the event details"
			/>
		);
	}

	if (error) {
		return (
			<div className="text-destructive">
				Failed to load event information. Please try again.
			</div>
		);
	}

	// Don't render form until event is loaded
	if (!event) {
		return (
			<LoadingState
				title="Loading event information..."
				description="Please wait while we fetch the event details"
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
					{/* Row 1: Event Title, Webhook URL, and Event Status */}
					<FormGroupContainer
						title={{
							icon: InfoIcon,
							label: "Event Information",
							description:
								"Fill in required fields to update the event information.",
						}}
					>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<form.Field name="title">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Event Title"
											htmlFor={field.name}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="Summer Festival 2024"
											disabled={updateEventMutation.isPending}
											required
										/>
									);
								}}
							</form.Field>

							<form.Field name="webhookUrl">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Webhook URL"
											htmlFor={field.name}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="https://example.com/webhook"
											disabled={updateEventMutation.isPending}
										/>
									);
								}}
							</form.Field>

							<form.Field name="status">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<SelectLabel
											label="Event Status"
											htmlFor={field.name}
											value={field.state.value}
											onChange={(value) =>
												field.handleChange(
													value as
														| "draft"
														| "published"
														| "cancelled"
														| "completed",
												)
											}
											onBlur={field.handleBlur}
											options={[
												{ value: "draft", label: "Draft" },
												{ value: "published", label: "Published" },
												{ value: "cancelled", label: "Cancelled" },
												{ value: "completed", label: "Completed" },
											]}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="Select status"
											disabled={updateEventMutation.isPending}
											required
										/>
									);
								}}
							</form.Field>
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<form.Field name="startDate">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<DateTimePickerField
											label="Start Date"
											htmlFor={field.name}
											value={field.state.value}
											onChange={(date) =>
												field.handleChange(date || new Date())
											}
											errors={field.state.meta.errors.map((error) => ({
												message:
													typeof error === "string" ? error : String(error),
											}))}
											isInvalid={isInvalid}
											placeholder="Pick start date and time"
											disabled={updateEventMutation.isPending}
											required
										/>
									);
								}}
							</form.Field>

							<form.Field name="endDate">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<DateTimePickerField
											label="End Date"
											htmlFor={field.name}
											value={field.state.value}
											onChange={(date) =>
												field.handleChange(date || new Date())
											}
											errors={field.state.meta.errors.map((error) => ({
												message:
													typeof error === "string" ? error : String(error),
											}))}
											isInvalid={isInvalid}
											placeholder="Pick end date and time"
											disabled={updateEventMutation.isPending}
											required
										/>
									);
								}}
							</form.Field>
						</div>

						<form.Field name="description">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<InputLabel
										label="Description"
										htmlFor={field.name}
										type="textarea"
										value={field.state.value}
										onChange={field.handleChange}
										onBlur={field.handleBlur}
										errors={field.state.meta.errors}
										isInvalid={isInvalid}
										placeholder="Enter event description..."
										className="min-h-[120px]"
										disabled={updateEventMutation.isPending}
										rows={4}
									/>
								);
							}}
						</form.Field>
					</FormGroupContainer>

					<FormGroupContainer
						title={{
							icon: Cog,
							label: "Event Configuration",
							description: "Configure the event settings and options.",
						}}
					>
						<div
							className={cn(
								"grid grid-cols-1 gap-4",
								!isOrgOwner ? "xl:grid-cols-2" : "xl:grid-cols-3",
							)}
						>
							{/* Only show visibility for org_owner */}
							{isOrgOwner && (
								<div className="flex flex-col gap-6 md:gap-4">
									{/* Visibility Section */}
									<FieldContent className="flex w-full flex-none flex-col gap-1">
										<FieldLabel>Event Visibility</FieldLabel>
										<FieldDescription className="text-balance">
											Select the visibility of your event.
										</FieldDescription>
									</FieldContent>
									<form.Field name="visibility">
										{(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<SwitchStateCardInput
													states={{
														checked: {
															label: "Visible",
															description:
																"The event will be visible to the public.",
															color: "green",
														},
														unchecked: {
															label: "Hidden",
															description:
																"The event will not be visible to the public.",
															color: "red",
														},
													}}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													onBlur={field.handleBlur}
													errors={field.state.meta.errors}
													isInvalid={isInvalid}
													disabled={updateEventMutation.isPending}
													variant="no-rounded"
												/>
											);
										}}
									</form.Field>
								</div>
							)}
							{/* Left Column: Visibility (if org_owner) and Event Types */}
							<div className="flex flex-col gap-6 md:gap-4">
								{/* Exhibitor Kit Section */}
								<FieldContent className="flex w-full flex-none flex-col gap-1">
									<FieldLabel>Event Types</FieldLabel>
									<FieldDescription className="text-balance">
										Select the type of event to be held.
									</FieldDescription>
								</FieldContent>
								<form.Field name="useTicket">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<SwitchStateCardInput
												states={{
													checked: {
														label: "Ticket System",
														description:
															"The event will be using the ticketing system. (Suitable for conferences, expos, workshops, etc.)",
														color: "cyan",
													},
													unchecked: {
														label: "Visitor System",
														description:
															"The event will be using the visitor system. (Suitable for trade shows, mall exhibitions, etc.)",
														color: "amber",
													},
												}}
												checked={field.state.value}
												onCheckedChange={field.handleChange}
												onBlur={field.handleBlur}
												errors={field.state.meta.errors}
												isInvalid={isInvalid}
												disabled={updateEventMutation.isPending}
												variant="no-rounded"
											/>
										);
									}}
								</form.Field>
							</div>
							<div className="flex flex-col gap-4">
								{/* Exhibitor Kit Section */}
								<FieldContent className="flex w-full flex-none flex-col gap-1">
									<FieldLabel>Option Flags</FieldLabel>
									<FieldDescription className="text-balance">
										Select the options for your event.
									</FieldDescription>
								</FieldContent>
								{/* Multiple Scans */}
								<form.Field name="multipleScans">
									{(field) => (
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
									)}
								</form.Field>
							</div>
						</div>
					</FormGroupContainer>

					{/* Row 2: Visibility, Event Types, Multiple Scans, and Exhibitor Kit Options */}
					<FormGroupContainer
						title={{
							icon: Box,
							label: "Exhibitor Kit",
							description:
								"Configure the event with full exhibitor kit features.",
						}}
					>
						{/* Exhibitor Kit Section */}
						<FieldContent className="flex flex-none flex-col gap-1">
							<FieldLabel>Exhibitor Kit</FieldLabel>
							<FieldDescription>Event Exhibitor Kit options.</FieldDescription>
						</FieldContent>
						<form.Field name="useExhibitorKit">
							{(exhibitorKitField) => {
								const useExhibitorKitValue = exhibitorKitField.state.value;

								return (
									<div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2")}>
										{/* Right Column: Multiple Scans and Exhibitor Kit Options */}

										{/* Enable Exhibitor Kit */}
										<SwitchCardInput
											label="Enable Exhibitor Kit"
											description="Allow exhibitor contractors to manage kits for exhibitors under their contractorships."
											htmlFor={exhibitorKitField.name}
											variant="no-rounded"
											border={true}
											checked={exhibitorKitField.state.value}
											onCheckedChange={(checked) => {
												exhibitorKitField.handleChange(checked);
												// Reset printing services when exhibitor kit is disabled
												if (!checked) {
													form.setFieldValue("allowPrintingServices", false);
												}
											}}
											disabled={updateEventMutation.isPending}
										/>

										{/* Allow Printing Services - only show when exhibitor kit is enabled */}
										{useExhibitorKitValue && (
											<form.Field name="allowPrintingServices">
												{(field) => (
													<SwitchCardInput
														label="Allow Printing Services"
														description="By enabling this, you will be able to let your exhibitor contractors to provide printing services to exhibitors."
														htmlFor={field.name}
														variant="no-rounded"
														border={true}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														disabled={updateEventMutation.isPending}
													/>
												)}
											</form.Field>
										)}
									</div>
								);
							}}
						</form.Field>
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
