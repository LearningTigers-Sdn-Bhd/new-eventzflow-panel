"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { FieldSectionLabel } from "@/components/admin-ui/form/field-section-label";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { useDialog } from "@/hooks/use-dialog";
import { getEventById } from "@/lib/api/event";
import { updatePendingTicket } from "@/lib/api/event/pending";
import { TicketTypeFieldSection } from "../../tickets/page-action/ticket-type-field-section";
import { getPaymentStatusNumber, PAYMENT_STATUS } from "../constants";
import type { PendingTicket } from "../pending-ticket-table-columns";

interface PendingTicketEditModalProps {
	ticket: PendingTicket;
}

export default function PendingTicketEditModal({
	ticket,
}: PendingTicketEditModalProps) {
	const { closeDialog } = useDialog();
	const params = useParams();
	const eventId = params.event_id as string;
	const queryClient = useQueryClient();

	// Generate unique IDs for form fields
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const paymentStatusId = useId();
	const screenshotUrlId = useId();
	const transactionIdId = useId();
	const paymentMethodId = useId();

	const [customFields, setCustomFields] = useState<
		Array<{ labelKey: string; labelName: string; value: string }>
	>([]);

	const { data: eventData, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	useEffect(() => {
		if (
			eventData?.labels_data &&
			Object.keys(eventData.labels_data).length > 0
		) {
			const fields = Object.entries(eventData.labels_data).map(
				([key, labelNameValue]) => {
					const currentLabelName = labelNameValue as string;

					// NOTE:
					// - Backend stores custom_fields_data as key -> value
					// - In transformPendingTicket, we currently set customLabels[{ name: key, value }]
					// - So here we must match by the key, not by the human-readable label name
					const existingLabel = ticket.customLabels?.find(
						(label) => label.name === key,
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

	// Update pending ticket mutation
	const updateMutation = useMutation({
		mutationFn: updatePendingTicket,
		onSuccess: () => {
			toast.success("Pending ticket updated successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "pending-tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update pending ticket");
		},
	});

	const form = useForm({
		defaultValues: {
			attendee_name: ticket.name ?? "",
			attendee_email: ticket.email ?? "",
			attendee_phone: ticket.phone ?? "",
			ticket_type_id: ticket.ticketTypeId || null,
			payment_status: getPaymentStatusNumber(ticket.paymentStatus),
			payment_method: ticket.paymentMethod ?? "",
			transaction_id: ticket.transactionId ?? "",
			payment_screenshot_url: ticket.paymentScreenshotUrl ?? "",
		},
		onSubmit: async ({ value }) => {
			const customFieldsData: Record<string, string> = {};
			customFields.forEach((field) => {
				if (field.value.trim()) {
					customFieldsData[field.labelKey] = field.value;
				}
			});

			try {
				await updateMutation.mutateAsync({
					eventId,
					ticketId: ticket.id,
					attendee_name: value.attendee_name,
					attendee_email: value.attendee_email.trim() || null,
					attendee_phone: value.attendee_phone || null,
					ticket_type_id: value.ticket_type_id || undefined,
					payment_status: value.payment_status,
					payment_screenshot_url: value.payment_screenshot_url || undefined,
					transaction_id: value.transaction_id || undefined,
					payment_method: value.payment_method || undefined,
					custom_fields_data:
						Object.keys(customFieldsData).length > 0
							? customFieldsData
							: undefined,
				});
			} catch {
				// Error is handled by onError callback
			}
		},
	});

	const updateCustomField = (labelKey: string, newValue: string) => {
		setCustomFields(
			customFields.map((field) =>
				field.labelKey === labelKey ? { ...field, value: newValue } : field,
			),
		);
	};

	return (
		<div className="px-4 md:px-6">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-8 md:space-y-16"
			>
				<FieldSet className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 md:gap-y-8 md:[&>*:last-child]:col-span-2">
					<FieldGroup className="space-y-0">
						{/* Attendee Information Section */}
						<div className="space-y-4">
							<FieldSectionLabel
								label="Attendee Information"
								description="Update the details of the ticket holder"
								className="border-border border-b pb-2"
							/>

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
										const errors = field.state.meta.errors;
										return (
											<InputLabel
												label="Full Name"
												htmlFor={nameId}
												placeholder="John Doe"
												value={field.state.value}
												onChange={(value) => field.handleChange(value)}
												onBlur={field.handleBlur}
												required
												disabled={updateMutation.isPending}
												errors={errors.map((error) =>
													error ? { message: String(error) } : undefined,
												)}
												isInvalid={errors.some(Boolean)}
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
										const errors = field.state.meta.errors;
										return (
											<InputLabel
												label="Email Address"
												htmlFor={emailId}
												placeholder="john.doe@example.com"
												value={field.state.value}
												onChange={(value) => field.handleChange(value)}
												onBlur={field.handleBlur}
												disabled={updateMutation.isPending}
												errors={errors.map((error) =>
													error ? { message: String(error) } : undefined,
												)}
												isInvalid={errors.some(Boolean)}
											/>
										);
									}}
								</form.Field>

								<form.Field name="attendee_phone">
									{(field) => (
										<InputLabel
											label="Phone Number"
											htmlFor={phoneId}
											placeholder="+1 234 567 8900"
											value={field.state.value}
											onChange={(value) => field.handleChange(value)}
											onBlur={field.handleBlur}
											disabled={updateMutation.isPending}
										/>
									)}
								</form.Field>
							</div>
						</div>
					</FieldGroup>

					{/* Ticket Type Section */}
					<FieldGroup className="space-y-0">
						<div className="space-y-4">
							<FieldSectionLabel
								label="Ticket Type"
								description="Select an existing ticket type or create a new one"
								className="border-border border-b pb-2"
							/>

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
								{(field) => {
									const adaptedField = {
										state: {
											value: field.state.value as number | null,
											meta: {
												errors: field.state.meta.errors as (
													| string
													| undefined
												)[],
											},
										},
										handleChange: (value: number) =>
											(field.handleChange as (val: number) => void)(value),
									};

									return (
										<TicketTypeFieldSection
											field={adaptedField}
											eventId={eventId}
											disabled={updateMutation.isPending}
										/>
									);
								}}
							</form.Field>
						</div>
					</FieldGroup>

					{/* Payment Information Section */}
					<FieldGroup className="space-y-0 md:col-span-2">
						<div className="space-y-4">
							<FieldSectionLabel
								label="Payment Information"
								description="Payment details for pending ticket verification"
								className="border-border border-b pb-2"
							/>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<form.Field name="payment_status">
									{(field) => (
										<SelectLabel
											label="Payment Status"
											htmlFor={paymentStatusId}
											value={field.state.value.toString()}
											onChange={(value) =>
												(field.handleChange as (val: number) => void)(
													Number.parseInt(value, 10),
												)
											}
											disabled={updateMutation.isPending}
											options={[
												{
													value: PAYMENT_STATUS.PENDING.toString(),
													label: "Pending",
												},
												{
													value: PAYMENT_STATUS.PAID.toString(),
													label: "Paid",
												},
												{
													value: PAYMENT_STATUS.FAILED.toString(),
													label: "Failed",
												},
												{
													value: PAYMENT_STATUS.REFUNDED_PAYMENT.toString(),
													label: "Refunded Payment",
												},
											]}
											description="Current status of the payment"
										/>
									)}
								</form.Field>

								<form.Field name="payment_method">
									{(field) => (
										<InputLabel
											label="Payment Method"
											htmlFor={paymentMethodId}
											placeholder="e.g., Bank Transfer, Credit Card"
											value={field.state.value}
											onChange={(value) => field.handleChange(value)}
											onBlur={field.handleBlur}
											disabled={updateMutation.isPending}
											description="Method used for payment (optional)"
										/>
									)}
								</form.Field>

								<form.Field name="transaction_id">
									{(field) => (
										<InputLabel
											label="Transaction ID"
											htmlFor={transactionIdId}
											placeholder="TXN123456789"
											value={field.state.value}
											onChange={(value) => field.handleChange(value)}
											onBlur={field.handleBlur}
											disabled={updateMutation.isPending}
											description="Transaction ID from payment provider (optional)"
										/>
									)}
								</form.Field>

								<form.Field name="payment_screenshot_url">
									{(field) => (
										<InputLabel
											label="Payment Screenshot URL"
											htmlFor={screenshotUrlId}
											placeholder="https://example.com/screenshot.jpg"
											value={field.state.value}
											onChange={(value) => field.handleChange(value)}
											onBlur={field.handleBlur}
											disabled={updateMutation.isPending}
											description="URL to the payment screenshot (optional)"
										/>
									)}
								</form.Field>
							</div>
						</div>
					</FieldGroup>

					{/* Custom Fields Section */}
					<FieldGroup className="space-y-0 md:col-span-2">
						<div className="space-y-4">
							<FieldSectionLabel
								label="Custom Labels"
								description={
									isLoadingEvent
										? "Loading custom labels..."
										: customFields.length > 0
											? "Update the custom labels configured for this event"
											: "No custom labels configured for this event"
								}
								className="border-border border-b pb-2"
							/>

							{customFields.length > 0 && (
								<div className="grid gap-4 md:grid-cols-2">
									{customFields.map((field) => (
										<InputLabel
											key={field.labelKey}
											label={field.labelName}
											placeholder={`Enter ${field.labelName.toLowerCase()}`}
											value={field.value}
											onChange={(value) =>
												updateCustomField(field.labelKey, value)
											}
											disabled={updateMutation.isPending}
										/>
									))}
								</div>
							)}
						</div>
					</FieldGroup>
				</FieldSet>
				<FieldGroup className="mt-6 flex flex-col justify-end gap-2 md:mt-0 md:flex-row">
					<Button
						type="button"
						variant="outline"
						onClick={closeDialog}
						disabled={updateMutation.isPending}
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
									updateMutation.isPending
								}
								className="rounded-none py-6 md:py-4"
							>
								{updateMutation.isPending
									? "Updating..."
									: "Update Pending Ticket"}
							</Button>
						)}
					</form.Subscribe>
				</FieldGroup>
			</form>
		</div>
	);
}
