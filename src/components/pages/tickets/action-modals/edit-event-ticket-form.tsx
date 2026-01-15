"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { useDialog } from "@/hooks/use-dialog";
import { getEventById } from "@/lib/api/event";
import { updateTicket } from "@/lib/api/ticket";
import type { BaseTicket } from "../event-ticket-table-columns";
import { TicketTypeFieldSection } from "../page-action/ticket-type-field-section";

interface EditTicketFormProps {
	ticket: BaseTicket;
}

export default function EditTicketForm({ ticket }: EditTicketFormProps) {
	const { closeDialog } = useDialog();
	const params = useParams();
	const eventId = params.event_id as string;
	const queryClient = useQueryClient();

	// Generate unique IDs for form fields
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const roleId = useId();

	// Custom fields state (kept separate since they're dynamic based on event data)
	const [customFields, setCustomFields] = useState<
		Array<{ labelKey: string; labelName: string; value: string }>
	>([]);

	// Fetch event details to get labels_data
	const { data: eventData, isLoading: _isLoadingEvent } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	// Initialize custom fields from event labels_data and populate with ticket data
	useEffect(() => {
		if (
			eventData?.labels_data &&
			Object.keys(eventData.labels_data).length > 0
		) {
			const fields = Object.entries(eventData.labels_data).map(
				([key, labelNameValue]) => {
					const currentLabelName = labelNameValue as string;
					const existingLabel = ticket.customLabels?.find(
						(label) => label.name === currentLabelName,
					);

					return {
						labelKey: key,
						labelName: currentLabelName,
						value: existingLabel?.value || "",
					};
				},
			);
			setCustomFields(fields);
		}
	}, [eventData, ticket.customLabels]);

	// Update ticket mutation
	const updateTicketMutation = useMutation({
		mutationFn: updateTicket,
		onSuccess: () => {
			toast.success("Ticket updated successfully!");
			// Invalidate the tickets query to refetch the list
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update ticket");
		},
	});

	const form = useForm({
		defaultValues: {
			attendee_name: ticket.name,
			attendee_email: ticket.email ?? "",
			attendee_phone: ticket.phone || "",
			ticket_type_id: ticket.ticketTypeId || null,
			role: ticket.role || "",
		},
		onSubmit: async ({ value }) => {
			if (!value.ticket_type_id) {
				return;
			}

			// Transform custom fields array to object
			// Include ALL label fields, even if empty (as empty strings)
			const customFieldsData: Record<string, string> = {};
			customFields.forEach((field) => {
				customFieldsData[field.labelKey] = field.value.trim();
			});

			await updateTicketMutation.mutateAsync({
				eventId,
				ticketId: ticket.publicId,
				attendee_name: value.attendee_name,
				attendee_email: value.attendee_email.trim() || null,
				attendee_phone: value.attendee_phone || null,
				ticket_type_id: value.ticket_type_id,
				role: value.role || undefined,
				custom_fields_data:
					customFields.length > 0 ? customFieldsData : undefined,
			});
		},
	});

	// Custom field handlers
	const updateCustomField = (labelKey: string, newValue: string) => {
		setCustomFields(
			customFields.map((field) =>
				field.labelKey === labelKey ? { ...field, value: newValue } : field,
			),
		);
	};

	return (
		<div className="h-full px-4 md:px-6">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="flex h-full flex-col justify-between gap-8"
			>
				<FieldSet className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 md:gap-y-8">
					<FormGroupContainer
						title={{
							icon: User,
							label: "Attendee Information",
							description: "Enter the details of the ticket holder",
						}}
					>
						{/* Attendee Information Section */}
						<div className="grid grid-cols-1 gap-4">
							<form.Field
								name="attendee_name"
								validators={{
									onChange: ({ value }) => {
										if (!value.trim() || value.length < 2) {
											return "Name must be at least 2 characters";
										}
										return undefined;
									},
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Full Name"
											htmlFor={nameId}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors.map((error) => ({
												message: String(error),
											}))}
											isInvalid={isInvalid}
											placeholder="John Doe"
											disabled={updateTicketMutation.isPending}
											required
										/>
									);
								}}
							</form.Field>

							<form.Field
								name="attendee_email"
								validators={{
									onChange: ({ value }) => {
										if (
											value.trim() &&
											!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
										) {
											return "Please enter a valid email address";
										}
										return undefined;
									},
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<InputLabel
											label="Email Address"
											htmlFor={emailId}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											errors={field.state.meta.errors.map((error) => ({
												message: String(error),
											}))}
											isInvalid={isInvalid}
											placeholder="john.doe@example.com"
											disabled={updateTicketMutation.isPending}
										/>
									);
								}}
							</form.Field>

							<form.Field name="attendee_phone">
								{(field) => (
									<InputLabel
										label="Phone Number"
										htmlFor={phoneId}
										value={field.state.value}
										onChange={field.handleChange}
										onBlur={field.handleBlur}
										placeholder="+1 234 567 8900"
										disabled={updateTicketMutation.isPending}
									/>
								)}
							</form.Field>

							<form.Field name="role">
								{(field) => (
									<InputLabel
										label="Role"
										htmlFor={roleId}
										value={field.state.value}
										onChange={field.handleChange}
										onBlur={field.handleBlur}
										placeholder="e.g. VIP, Speaker, Staff"
										disabled={updateTicketMutation.isPending}
									/>
								)}
							</form.Field>
						</div>
						<form.Field
							name="ticket_type_id"
							validators={{
								onChange: ({ value }) => {
									if (!value || value <= 0) {
										return "Please select a ticket type";
									}
									return undefined;
								},
							}}
						>
							{(field) => (
								<TicketTypeFieldSection
									field={field}
									eventId={eventId}
									disabled={updateTicketMutation.isPending}
								/>
							)}
						</form.Field>
					</FormGroupContainer>
					<FormGroupContainer
						title={{
							icon: FileText,
							label: "Additional Information",
							description:
								"Fill in the additional information set by the event organizer for the ticket holder",
						}}
					>
						{customFields.length > 0 ? (
							<div className="grid gap-4 md:grid-cols-3 2xl:grid-cols-5">
								{customFields.map((field) => (
									<InputLabel
										key={field.labelKey}
										label={field.labelName}
										value={field.value}
										onChange={(value) =>
											updateCustomField(field.labelKey, value)
										}
										placeholder={`Enter ${field.labelName.toLowerCase()}`}
										disabled={updateTicketMutation.isPending}
									/>
								))}
							</div>
						) : (
							<EmptyState
								title="No custom labels"
								description="No custom labels have been configured for this event."
								icon={<FileText />}
								height="h-auto"
							/>
						)}
					</FormGroupContainer>
				</FieldSet>
				<FieldGroup className="flex flex-col justify-end gap-2 md:flex-row">
					<Button
						type="button"
						variant="outline"
						onClick={closeDialog}
						disabled={updateTicketMutation.isPending}
						className="rounded-none py-6 md:py-4"
					>
						Cancel
					</Button>
					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								disabled={
									!state.canSubmit ||
									state.isSubmitting ||
									updateTicketMutation.isPending
								}
								className="rounded-none py-6 md:py-4"
							>
								{updateTicketMutation.isPending
									? "Updating..."
									: "Update Ticket"}
							</Button>
						)}
					</form.Subscribe>
				</FieldGroup>
			</form>
		</div>
	);
}
