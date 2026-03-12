"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Box, Cog, InfoIcon } from "lucide-react";
import { useId } from "react";
import { toast } from "sonner";
import { z } from "zod";
import DateTimePickerField from "@/components/admin-ui/form/date-time-picker";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { SwitchCardInput } from "@/components/admin-ui/form/switch-card-input";
import { SwitchStateCardInput } from "@/components/admin-ui/form/switch-state-card-input";
import { Button } from "@/components/ui/button";
import {
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { useAuth } from "@/hooks/auth/use-auth";
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
		useSeatTicketing: z.boolean(),
		useExhibitorKit: z.boolean(),
		allowPrintingServices: z.boolean(),
		useBusinessMatching: z.boolean(),
		useSponsorship: z.boolean(),
	useEventLeads: z.boolean(),
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
	const formId = useId();
	const sectionId = useId();
	const { user } = useAuth();

	// Only org_owner can assign event admin
	const canAssignEventAdmin = user?.role === "org_owner";

	// Fetch team members for event admin selection (only members with role "member")
	// Only fetch if user is org_owner
	const { data: teamMembers = [], isLoading: isLoadingOrganizers } = useQuery({
		queryKey: ["team_members"],
		queryFn: () => getTeamMembers(),
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
			useSeatTicketing: false,
			useExhibitorKit: false,
			allowPrintingServices: false,
			useBusinessMatching: false,
			useSponsorship: false,
			useEventLeads: false,
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
				use_wedding: false,
				use_seat_ticketing: value.useSeatTicketing ?? false,
				use_exhibitor_kit: value.useExhibitorKit ?? false,
				allow_contractor_printing_services:
					value.allowPrintingServices ?? false,
				use_business_matching: value.useBusinessMatching ?? false,
				use_sponsorship: value.useSponsorship ?? false,
				use_event_leads: value.useEventLeads ?? false,
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
					{/* Event Information */}
					<FormGroupContainer
						title={{
							icon: InfoIcon,
							label: "Event Information",
							description: "Fill in required fields to create the event.",
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
											disabled={createEventMutation.isPending}
											required
											autoFocus
										/>
									);
								}}
							</form.Field>

							{canAssignEventAdmin && (
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
												placeholder="Select status"
												disabled={createEventMutation.isPending}
												required
											/>
										);
									}}
								</form.Field>
							)}

							{canAssignEventAdmin && (
								<form.Field name="eventAdminId">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<SelectLabel
												label="Event Admin"
												htmlFor={field.name}
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
													isLoadingOrganizers
														? "Loading users..."
														: "Select event admin (optional)"
												}
												disabled={
													createEventMutation.isPending || isLoadingOrganizers
												}
												emptyMessage={
													isLoadingOrganizers
														? "Loading members..."
														: "No active members available"
												}
											/>
										);
									}}
								</form.Field>
							)}
						</div>
						{!canAssignEventAdmin && (
							<form.Field name="status">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<SelectLabel
											label="Event Status"
											htmlFor={field.name}
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
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
											disabled={createEventMutation.isPending}
											required
										/>
									);
								}}
							</form.Field>

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
											disabled={createEventMutation.isPending}
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
										disabled={createEventMutation.isPending}
										rows={4}
									/>
								);
							}}
						</form.Field>
					</FormGroupContainer>

					{/* Event Configuration */}
					<FormGroupContainer
						title={{
							icon: Cog,
							label: "Event Configuration",
							description: "Configure the event settings and options.",
						}}
					>
						<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
							{/* Visibility */}
							<div className="flex flex-col gap-6 md:gap-4">
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
												disabled={createEventMutation.isPending}
												variant="no-rounded"
											/>
										);
									}}
								</form.Field>
							</div>
							{/* Event Types */}
							<div className="flex flex-col gap-6 md:gap-4">
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
												disabled={createEventMutation.isPending}
												variant="no-rounded"
											/>
										);
									}}
								</form.Field>
								<div className="flex flex-col gap-4">
									<form.Field name="useSeatTicketing">
										{(field) => {
											return (
												<SwitchCardInput
													label="Seat Ticketing System"
													description="Enable reserved seat sessions and seat maps for this event."
													htmlFor={field.name}
													variant="no-rounded"
													border={true}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={createEventMutation.isPending}
												/>
											);
										}}
									</form.Field>
									<form.Field name="useBusinessMatching">
										{(field) => {
											return (
												<SwitchCardInput
													label="Business Matching"
													description="Allow business matching for this event."
													htmlFor={field.name}
													variant="no-rounded"
													border={true}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={createEventMutation.isPending}
												/>
											);
										}}
									</form.Field>
									<form.Field name="useSponsorship">
										{(field) => {
											return (
												<SwitchCardInput
													label="Sponsorships"
													description="Enable sponsorship management for this event."
													htmlFor={field.name}
													variant="no-rounded"
													border={true}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={createEventMutation.isPending}
												/>
											);
										}}
									</form.Field>
									<form.Field name="useEventLeads">
										{(field) => {
											return (
												<SwitchCardInput
													label="Event Leads"
													description="Allow vendors to scan attendee QR codes to capture leads."
													htmlFor={field.name}
													variant="no-rounded"
													border={true}
													checked={field.state.value}
													onCheckedChange={field.handleChange}
													disabled={createEventMutation.isPending}
												/>
											);
										}}
									</form.Field>
								</div>
							</div>
						</div>
					</FormGroupContainer>

					{/* Exhibitor Kit */}
					<FormGroupContainer
						title={{
							icon: Box,
							label: "Exhibitor Kit",
							description:
								"Configure the event with full exhibitor kit features.",
						}}
					>
						<FieldContent className="flex flex-none flex-col gap-1">
							<FieldLabel>Exhibitor Kit</FieldLabel>
							<FieldDescription>Event Exhibitor Kit options.</FieldDescription>
						</FieldContent>
						<form.Field name="useExhibitorKit">
							{(exhibitorKitField) => {
								const useExhibitorKitValue = exhibitorKitField.state.value;

								return (
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
											disabled={createEventMutation.isPending}
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
														disabled={createEventMutation.isPending}
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
		</section>
	);
}
