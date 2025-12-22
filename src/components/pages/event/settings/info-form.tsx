"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useId } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { getEventById, updateEvent } from "@/lib/api/event";
import type { UpdateEventRequest } from "@/lib/api/event/request";
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
				form.setFieldValue("status", event.status as "draft" | "published" | "cancelled" | "completed");
				form.setFieldValue("visibility", event.visibility ?? true);
				form.setFieldValue("useTicket", event.use_ticket ?? true);
				form.setFieldValue("useExhibitorKit", event.use_exhibitor_kit ?? false);
				form.setFieldValue("allowPrintingServices", event.allow_contractor_printing_services ?? false);
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
		<section id={sectionId} className="w-full">
			<form
				id={formId}
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<FieldSet>
					<FieldLegend className="font-bold text-xl!">
						Event ID: {eventId}
					</FieldLegend>
					<FieldDescription>Manage your event information.</FieldDescription>
					<FieldSeparator />
					<FieldGroup>
						{/* Row 1: Event Title, Webhook URL, and Event Status */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
							<form.Field name="title">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field
											data-invalid={isInvalid}
											orientation="vertical"
											className="md:col-span-2"
										>
											<FieldLabel htmlFor={field.name}>
												Event Title *
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="Summer Festival 2024"
												disabled={updateEventMutation.isPending}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="webhookUrl">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field
											data-invalid={isInvalid}
											orientation="vertical"
										>
											<FieldLabel htmlFor={field.name}>Webhook URL</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="https://example.com/webhook"
												type="url"
												disabled={updateEventMutation.isPending}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="status">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid} orientation="vertical">
											<FieldLabel htmlFor={field.name}>
												Event Status *
											</FieldLabel>
											<Select
												value={String(field.state.value)}
												onValueChange={(value) =>
													field.handleChange(
														value as "draft" | "published" | "cancelled" | "completed",
													)
												}
												disabled={updateEventMutation.isPending}
											>
												<SelectTrigger id={field.name} className="w-full">
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="draft">Draft</SelectItem>
													<SelectItem value="published">Published</SelectItem>
													<SelectItem value="cancelled">Cancelled</SelectItem>
													<SelectItem value="completed">Completed</SelectItem>
												</SelectContent>
											</Select>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						</div>

						{/* Row 2: All Toggles in one row - dynamically adjust columns based on ticketing and exhibitor kit state */}
						<form.Field name="useTicket" mode="array">
							{(useTicketField) => {
								const useTicketValue = useTicketField.state.value;
								
								return (
									<form.Field name="useExhibitorKit" mode="array">
										{(exhibitorKitField) => {
											const useExhibitorKitValue = exhibitorKitField.state.value;
											
											// Calculate grid columns based on visibility of toggles
											const getGridCols = () => {
												if (!useTicketValue) {
													// Ticketing disabled: Multiple Scans, Visibility (if org_owner), Ticketing
													return isOrgOwner ? "md:grid-cols-3" : "md:grid-cols-2";
												}
												if (useExhibitorKitValue) {
													// All toggles visible
													return isOrgOwner ? "md:grid-cols-5" : "md:grid-cols-4";
												}
												// Ticketing enabled but exhibitor kit disabled
												return isOrgOwner ? "md:grid-cols-4" : "md:grid-cols-3";
											};
											
											return (
												<div className={`grid grid-cols-1 gap-4 ${getGridCols()}`}>
													<form.Field name="multipleScans">
														{(field) => {
															return (
																<Field orientation="vertical">
																	<FieldLabel htmlFor={field.name}>
																		Multiple Scans
																	</FieldLabel>
																	<div className="flex h-9 items-center rounded-lg border border-primary/50 p-4">
																		<Switch
																			id={field.name}
																			checked={field.state.value}
																			onCheckedChange={(checked) =>
																				field.handleChange(checked)
																			}
																			disabled={updateEventMutation.isPending}
																		/>
																		<span className="ml-2 text-muted-foreground text-sm">
																			{field.state.value ? "Enabled" : "Disabled"}
																		</span>
																	</div>
																</Field>
															);
														}}
													</form.Field>

													{/* Only show visibility for org_owner */}
													{isOrgOwner && (
														<form.Field name="visibility">
															{(field) => {
																return (
																	<Field orientation="vertical">
																		<FieldLabel htmlFor={field.name}>
																			Event Visibility
																		</FieldLabel>
																		<div className="flex h-9 items-center rounded-lg border border-primary/50 p-4">
																			<Switch
																				id={field.name}
																				checked={field.state.value}
																				onCheckedChange={(checked) =>
																					field.handleChange(checked)
																				}
																				disabled={updateEventMutation.isPending}
																			/>
																			<span className="ml-2 text-muted-foreground text-sm">
																				{field.state.value ? "Visible" : "Hidden"}
																			</span>
																		</div>
																	</Field>
																);
															}}
														</form.Field>
													)}

													<Field orientation="vertical">
														<FieldLabel htmlFor={useTicketField.name}>
															Use Ticketing System
														</FieldLabel>
														<div className="flex h-9 items-center rounded-lg border border-primary/50 p-4">
															<Switch
																id={useTicketField.name}
																checked={useTicketField.state.value}
																onCheckedChange={(checked) => {
																	useTicketField.handleChange(checked);
																	// Reset exhibitor kit and printing services when ticketing is disabled
																	if (!checked) {
																		form.setFieldValue("useExhibitorKit", false);
																		form.setFieldValue("allowPrintingServices", false);
																	}
																}}
																disabled={updateEventMutation.isPending}
															/>
															<span className="ml-2 text-muted-foreground text-sm">
																{useTicketField.state.value ? "Enabled" : "Disabled"}
															</span>
														</div>
													</Field>

													{/* Only show exhibitor kit when ticketing is enabled */}
													{useTicketValue && (
														<Field orientation="vertical">
															<FieldLabel htmlFor={exhibitorKitField.name}>
																Use Exhibitor Kit
															</FieldLabel>
															<div className="flex h-9 items-center rounded-lg border border-primary/50 p-4">
																<Switch
																	id={exhibitorKitField.name}
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
																<span className="ml-2 text-muted-foreground text-sm">
																	{exhibitorKitField.state.value ? "Enabled" : "Disabled"}
																</span>
															</div>
														</Field>
													)}

													{/* Only show printing services when exhibitor kit is enabled */}
													{useExhibitorKitValue && (
														<form.Field name="allowPrintingServices">
															{(field) => {
																return (
																	<Field orientation="vertical">
																		<FieldLabel htmlFor={field.name}>
																			Use Printing Services
																		</FieldLabel>
																		<div className="flex h-9 items-center rounded-lg border border-primary/50 p-4">
																			<Switch
																				id={field.name}
																				checked={field.state.value}
																				onCheckedChange={(checked) =>
																					field.handleChange(checked)
																				}
																				disabled={updateEventMutation.isPending}
																			/>
																			<span className="ml-2 text-muted-foreground text-sm">
																				{field.state.value ? "Enabled" : "Disabled"}
																			</span>
																		</div>
																	</Field>
																);
															}}
														</form.Field>
													)}
												</div>
											);
										}}
									</form.Field>
								);
							}}
						</form.Field>

						{/* Row 3: Start Date and End Date */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<form.Field name="startDate">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid} orientation="vertical">
											<FieldLabel htmlFor={field.name}>Start Date *</FieldLabel>
											<DateTimePicker
												date={field.state.value}
												onDateChange={(date) =>
													field.handleChange(date || new Date())
												}
												disabled={updateEventMutation.isPending}
												placeholder="Pick start date and time"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="endDate">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid} orientation="vertical">
											<FieldLabel htmlFor={field.name}>End Date *</FieldLabel>
											<DateTimePicker
												date={field.state.value}
												onDateChange={(date) =>
													field.handleChange(date || new Date())
												}
												disabled={updateEventMutation.isPending}
												placeholder="Pick end date and time"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						</div>

						{/* Row 4: Description (Full Width) */}
						<form.Field name="description">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid} orientation="vertical">
										<FieldLabel htmlFor={field.name}>Description</FieldLabel>
										<Textarea
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Enter event description..."
											className="min-h-[120px] resize-none"
											disabled={updateEventMutation.isPending}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<div className="mt-6 flex justify-end">
							<Button type="submit" disabled={updateEventMutation.isPending}>
								{updateEventMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</section>
	);
}
