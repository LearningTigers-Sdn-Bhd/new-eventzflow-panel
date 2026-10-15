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
import { createTicket } from "@/lib/api/ticket";
import { TicketTypeFieldSection } from "./ticket-type-field-section";

export default function TicketForm() {
	const { closeDialog } = useDialog();
	const params = useParams();
	const eventId = params.event_id as string;
	const queryClient = useQueryClient();

	// Generate unique IDs for form fields
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const roleId = useId();
	const quantityId = useId();

	// Custom fields state (kept separate since they're dynamic based on event data)
	const [customFields, setCustomFields] = useState<
		Array<{ labelKey: string; labelName: string; value: string }>
	>([]);

	// Fetch event details to get labels_data
	const { data: eventData, isLoading: _isLoadingEvent } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	// Initialize custom fields from event labels_data
	useEffect(() => {
		if (
			eventData?.labels_data &&
			Object.keys(eventData.labels_data).length > 0
		) {
			const fields = Object.entries(eventData.labels_data).map(
				([key, value]) => ({
					labelKey: key,
					labelName: value as string,
					value: "",
				}),
			);
			setCustomFields(fields);
		}
	}, [eventData]);

	// Create ticket mutation
	const createTicketMutation = useMutation({
		mutationFn: createTicket,
		onSuccess: () => {
			toast.success("Ticket created successfully!");
			// Invalidate the tickets query to refetch the list
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create ticket");
		},
	});

	const allowMultiplePerEmail =
		eventData?.allow_multiple_tickets_per_email ?? false;

	const form = useForm({
		defaultValues: {
			attendee_name: "",
			attendee_email: "",
			attendee_phone: "",
			ticket_type_id: null as number | null,
			role: "",
			quantity: "1",
		},
		onSubmit: async ({ value }) => {
			if (!value.ticket_type_id) {
				return;
			}

			// Transform custom fields array to object
			const customFieldsData: Record<string, string> = {};
			customFields.forEach((field) => {
				if (field.value.trim()) {
					customFieldsData[field.labelKey] = field.value;
				}
			});

			const quantity = allowMultiplePerEmail
				? Math.max(1, Number.parseInt(value.quantity, 10) || 1)
				: undefined;

			await createTicketMutation.mutateAsync({
				eventId,
				attendee_name: value.attendee_name,
				attendee_email: value.attendee_email.trim() || null,
				attendee_phone: value.attendee_phone || undefined,
				ticket_type_id: value.ticket_type_id,
				role: value.role || undefined,
				custom_fields_data:
					Object.keys(customFieldsData).length > 0
						? customFieldsData
						: undefined,
				payment_status: 1, // Automatically set to paid (1 = paid)
				quantity,
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
					{/* <FieldGroup className="space-y-0">
						<FieldSectionLabel
							label="Attendee Information"
							description="Enter the details of the ticket holder"
							className="border-border border-b pb-2"
						/> */}
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
											disabled={createTicketMutation.isPending}
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
											disabled={createTicketMutation.isPending}
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
										disabled={createTicketMutation.isPending}
									/>
								)}
							</form.Field>

							<div
								className={
									allowMultiplePerEmail ? "grid grid-cols-2 gap-4" : undefined
								}
							>
								<form.Field name="role">
									{(field) => (
										<InputLabel
											label="Role"
											htmlFor={roleId}
											value={field.state.value}
											onChange={field.handleChange}
											onBlur={field.handleBlur}
											placeholder="e.g. VIP, Speaker, Staff"
											disabled={createTicketMutation.isPending}
										/>
									)}
								</form.Field>

								{allowMultiplePerEmail && (
									<form.Field
										name="quantity"
										validators={{
											onChange: ({ value }) => {
												const parsed = Number.parseInt(value, 10);
												if (!Number.isFinite(parsed) || parsed < 1) {
													return "Quantity must be at least 1";
												}
												if (parsed > 50) {
													return "Quantity cannot exceed 50";
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
													label="Quantity"
													htmlFor={quantityId}
													inputType="number"
													value={field.state.value}
													onChange={field.handleChange}
													onBlur={field.handleBlur}
													min={1}
													max={50}
													errors={field.state.meta.errors.map((error) => ({
														message: String(error),
													}))}
													isInvalid={isInvalid}
													description="Creates this many identical paid tickets under one purchase"
													disabled={createTicketMutation.isPending}
												/>
											);
										}}
									</form.Field>
								)}
							</div>
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
									disabled={createTicketMutation.isPending}
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
										disabled={createTicketMutation.isPending}
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

						{/* Submit Buttons - Right Aligned */}
					</FormGroupContainer>
				</FieldSet>
				<FieldGroup className="flex flex-col justify-end gap-2 md:flex-row">
					<Button
						type="button"
						variant="outline"
						onClick={closeDialog}
						disabled={createTicketMutation.isPending}
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
									createTicketMutation.isPending
								}
								className="rounded-none py-6 md:py-4"
							>
								{createTicketMutation.isPending
									? "Creating..."
									: "Create Paid Ticket"}
							</Button>
						)}
					</form.Subscribe>
				</FieldGroup>
			</form>
		</div>
	);
}
