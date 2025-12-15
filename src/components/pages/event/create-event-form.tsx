"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId } from "react";
import { toast } from "sonner";
import { z } from "zod";
import DateTimePickerField from "@/components/admin-ui/form/date-time-picker";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { RadioGroupCard } from "@/components/admin-ui/form/radio-group-card";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { Button } from "@/components/ui/button";
import {
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { useAuth } from "@/hooks/use-auth";
import { createEvent } from "@/lib/api/event";
import { getTeamMembers } from "@/lib/api/team";
import { queryClient } from "@/utils/rest-api";

interface CreateEventFormProps {
	onClose: () => void;
}

// Form schema for validation (using camelCase for form state)
const formSchema = z
	.object({
		title: z.string().min(3, "Event name must be at least 3 characters"),
		visibility: z.boolean(),
		useTicket: z.boolean(),
		useExhibitorKit: z.boolean(),
		allowPrintingServices: z.boolean(),
		status: z.enum(["draft", "published", "cancelled"]),
		eventAdminId: z.union([z.string(), z.undefined()]),
		description: z.string(),
		startDate: z
			.union([z.date(), z.undefined()])
			.refine((val) => val instanceof Date, {
				message: "Start date is required",
			}),
		endDate: z
			.union([z.date(), z.undefined()])
			.refine((val) => val instanceof Date, {
				message: "End date is required",
			}),
	})
	.refine(
		(data) => {
			if (!data.startDate || !data.endDate) return true; // Required validation handled above
			return data.endDate >= data.startDate;
		},
		{
			message: "End date must be after start date",
			path: ["endDate"],
		},
	);

export default function CreateEventForm({ onClose }: CreateEventFormProps) {
	const { user } = useAuth();
	const titleId = useId();
	const _visibilityId = useId();
	const _useTicketId = useId();
	const useExhibitorKitId = useId();
	const allowPrintingServicesId = useId();
	const statusId = useId();
	const eventAdminId = useId();
	const descriptionId = useId();
	const startDateId = useId();
	const endDateId = useId();

	// Only org_owner can assign event admin
	const canAssignEventAdmin = user?.role === "org_owner";

	// Fetch team members for event admin selection (only members with role "member")
	// Only fetch if user is org_owner
	const { data: teamMembers = [], isLoading: isLoadingUsers } = useQuery({
		queryKey: ["team-members"],
		queryFn: getTeamMembers,
		enabled: canAssignEventAdmin,
	});

	// Filter only users with role "member" and active status
	const memberUsers = teamMembers.filter(
		(member) => member.role === "member" && member.status === "active",
	);

	const createEventMutation = useMutation({
		mutationFn: createEvent,
		onSuccess: () => {
			toast.success("Event created successfully!");
			// Invalidate and refetch events query
			queryClient.invalidateQueries({
				queryKey: ["events"],
			});
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create event");
		},
	});

	const form = useForm({
		defaultValues: {
			title: "",
			visibility: true,
			useTicket: true,
			useExhibitorKit: false,
			allowPrintingServices: false,
			status: "draft" as "draft" | "published" | "cancelled",
			eventAdminId: undefined as string | undefined,
			description: "",
			startDate: undefined as Date | undefined,
			endDate: undefined as Date | undefined,
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			const payload = {
				title: value.title.trim(),
				visibility: value.visibility ?? true,
				use_ticket: value.useTicket ?? true,
				use_exhibitor_kit: value.useExhibitorKit ?? false,
				allow_contractor_printing_services:
					value.allowPrintingServices ?? false,
				status: value.status ?? "draft",
				description: value.description.trim() || undefined,
				start_date: value.startDate?.toISOString() || "",
				end_date: value.endDate?.toISOString() || "",
				multiple_scans: false,
				...(value.eventAdminId && {
					event_admin_id: Number(value.eventAdminId),
				}),
			};

			await createEventMutation.mutateAsync(payload);
		},
	});

	return (
		<div className="h-full w-full px-2 pb-8 md:px-6">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="flex min-h-full w-full flex-col justify-between gap-4"
			>
				<FieldGroup className="flex-1 gap-6 px-2 md:gap-4 md:px-2">
					{/* Row 1: Event Title (Full Width) */}
					<form.Field name="title">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<InputLabel
									label="Event Title"
									htmlFor={titleId}
									value={field.state.value}
									onChange={field.handleChange}
									onBlur={field.handleBlur}
									errors={field.state.meta.errors}
									isInvalid={isInvalid}
									placeholder="Enter event title"
									disabled={createEventMutation.isPending}
									autoFocus
									required
								/>
							);
						}}
					</form.Field>

					{/* Row 2: Visibility, EventTypes, and ExhibitorKit/Printing row */}
					<form.Field name="useExhibitorKit" mode="array">
						{(exhibitorKitField) => {
							const useExhibitorKitValue = exhibitorKitField.state.value;
							return (
								<div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4">
									{/* Visibility */}
									<form.Field name="visibility">
										{(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<RadioGroupCard
													label="Event Visibility"
													description="Select if you want to make your event visible to the public."
													options={[
														{
															value: "yes",
															label: "Visible",
															description:
																"The event will be visible to the public.",
														},
														{
															value: "no",
															label: "Hidden",
															description:
																"The event will not be visible to the public.",
														},
													]}
													value={field.state.value ? "yes" : "no"}
													onChange={(value) =>
														field.handleChange(value === "yes")
													}
													onBlur={field.handleBlur}
													errors={field.state.meta.errors}
													isInvalid={isInvalid}
													disabled={createEventMutation.isPending}
												/>
											);
										}}
									</form.Field>

									{/* Ticketing System */}
									<form.Field name="useTicket">
										{(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<RadioGroupCard
													label="Select Event Types"
													description="Select the event types you want to use for your event."
													options={[
														{
															value: "yes",
															label: "Ticket System",
															description:
																"The event will be using the ticketing system. (Suitable for conferences, expos, workshops, etc.)",
														},
														{
															value: "no",
															label: "Visitor System",
															description:
																"The event will be using the visitor system. (Suitable for trade shows, mall exhibitions, etc.)",
														},
													]}
													value={field.state.value ? "yes" : "no"}
													onChange={(value) =>
														field.handleChange(value === "yes")
													}
													onBlur={field.handleBlur}
													errors={field.state.meta.errors}
													isInvalid={isInvalid}
													disabled={createEventMutation.isPending}
												/>
											);
										}}
									</form.Field>

									{/* ExhibitorKit and Printing Services Column */}
									<div className="flex flex-col gap-4">
										<FieldContent className="flex flex-none flex-col gap-1">
											<FieldLabel>Exhibitor Kit</FieldLabel>
											<FieldDescription>
												Event Exhibitor Kit options.
											</FieldDescription>
										</FieldContent>
										{/* Exhibitor Kit */}
										<SwitchCardInput
											label="Enable Exhibitor Kit"
											description="Allow exhibitor contractors to manage kits for exhibitors under their contractorships."
											htmlFor={useExhibitorKitId}
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
											disabled={createEventMutation.isPending}
										/>

										{/* Use Printing Services - only show when exhibitor kit is enabled */}
										{useExhibitorKitValue && (
											<form.Field name="allowPrintingServices">
												{(field) => (
													<SwitchCardInput
														label="Allow Printing Services"
														description="By enabling this, you will be able to let your exhibitor contractors to provide printing services to exhibitors."
														htmlFor={allowPrintingServicesId}
														variant="no-rounded"
														border={true}
														checked={field.state.value}
														onCheckedChange={field.handleChange}
														disabled={createEventMutation.isPending}
													/>
												)}
											</form.Field>
										)}
									</div>
								</div>
							);
						}}
					</form.Field>

					{/* Row 3: Event Status and Event Admin */}
					{canAssignEventAdmin ? (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{/* Event Status */}
							<form.Field name="status">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<SelectLabel
											label="Event Status"
											htmlFor={statusId}
											value={field.state.value}
											onChange={(value) =>
												field.handleChange(
													value as "draft" | "published" | "cancelled",
												)
											}
											onBlur={field.handleBlur}
											options={[
												{ value: "draft", label: "Draft" },
												{ value: "published", label: "Published" },
												{ value: "cancelled", label: "Cancelled" },
											]}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder="Select event status"
											disabled={createEventMutation.isPending}
											required
										/>
									);
								}}
							</form.Field>

							{/* Event Admin - Only visible to org_owner */}
							<form.Field name="eventAdminId">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<SelectLabel
											label="Event Admin"
											htmlFor={eventAdminId}
											value={field.state.value || ""}
											onChange={(value) =>
												field.handleChange(value || undefined)
											}
											onBlur={field.handleBlur}
											options={memberUsers.map((user) => ({
												value: user.id.toString(),
												label: `${user.full_name} (${user.email})`,
											}))}
											errors={field.state.meta.errors}
											isInvalid={isInvalid}
											placeholder={
												isLoadingUsers
													? "Loading users..."
													: "Select event admin (optional)"
											}
											disabled={createEventMutation.isPending || isLoadingUsers}
											emptyMessage={
												isLoadingUsers
													? "Loading members..."
													: "No active members available"
											}
										/>
									);
								}}
							</form.Field>
						</div>
					) : (
						/* Event Status - Full width for organizers */
						<form.Field name="status">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<SelectLabel
										label="Event Status"
										htmlFor={statusId}
										description="Select the status of your event."
										value={field.state.value}
										onChange={(value) =>
											field.handleChange(
												value as "draft" | "published" | "cancelled",
											)
										}
										onBlur={field.handleBlur}
										options={[
											{ value: "draft", label: "Draft" },
											{ value: "published", label: "Published" },
											{ value: "cancelled", label: "Cancelled" },
										]}
										errors={field.state.meta.errors.map((error) => ({
											message:
												typeof error === "string" ? error : String(error),
										}))}
										isInvalid={isInvalid}
										placeholder="Select event status"
										disabled={createEventMutation.isPending}
										required
									/>
								);
							}}
						</form.Field>
					)}

					{/* Row 4: Start and End Date */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Start Date */}
						<form.Field
							name="startDate"
							validators={{
								onBlur: ({ value }) => {
									if (!value) {
										return "Start date is required";
									}
									return undefined;
								},
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<DateTimePickerField
										label="Start Date"
										htmlFor={startDateId}
										value={field.state.value}
										onChange={(date) => field.handleChange(date || undefined)}
										errors={field.state.meta.errors.map((error) => ({
											message:
												typeof error === "string" ? error : String(error),
										}))}
										isInvalid={isInvalid}
										placeholder="Pick start date and time"
										disabled={createEventMutation.isPending}
										required
									/>
								);
							}}
						</form.Field>

						{/* End Date */}
						<form.Field
							name="endDate"
							validators={{
								onBlur: ({ value }) => {
									if (!value) {
										return "End date is required";
									}
									return undefined;
								},
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<DateTimePickerField
										label="End Date"
										htmlFor={endDateId}
										value={field.state.value}
										onChange={(date) => field.handleChange(date || undefined)}
										errors={field.state.meta.errors.map((error) => ({
											message:
												typeof error === "string" ? error : String(error),
										}))}
										isInvalid={isInvalid}
										placeholder="Pick end date and time"
										disabled={createEventMutation.isPending}
										required
									/>
								);
							}}
						</form.Field>
					</div>

					{/* Event Description */}
					<form.Field name="description">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<InputLabel
									label="Description"
									htmlFor={descriptionId}
									type="textarea"
									value={field.state.value}
									onChange={field.handleChange}
									onBlur={field.handleBlur}
									errors={field.state.meta.errors}
									isInvalid={isInvalid}
									className="min-h-[120px]"
									placeholder="Enter event description (optional)"
									disabled={createEventMutation.isPending}
									rows={4}
								/>
							);
						}}
					</form.Field>
				</FieldGroup>
				<FieldGroup className="flex flex-col justify-end gap-2 lg:flex-row">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="w-full rounded-none py-6 lg:w-auto lg:py-0"
						disabled={createEventMutation.isPending}
					>
						Cancel
					</Button>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button
								type="submit"
								disabled={!canSubmit || createEventMutation.isPending}
								className="w-full rounded-none py-6 lg:w-auto lg:py-0"
							>
								{createEventMutation.isPending || isSubmitting
									? "Creating..."
									: "Create Event"}
							</Button>
						)}
					</form.Subscribe>
				</FieldGroup>
			</form>
		</div>
	);
}
