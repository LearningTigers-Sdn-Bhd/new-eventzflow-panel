"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, FileText, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { useDialog } from "@/hooks/use-dialog";
import { getEventById } from "@/lib/api/event";
import { createPendingTicket } from "@/lib/api/event/pending";
import { TicketTypeFieldSection } from "../../tickets/page-action/ticket-type-field-section";
import { PAYMENT_STATUS } from "../constants";

export default function PendingTicketForm() {
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
	const roleId = useId();

	// Custom fields state (dynamic based on event data)
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
				([key, value]) => ({
					labelKey: key,
					labelName: value as string,
					value: "",
				}),
			);
			setCustomFields(fields);
		}
	}, [eventData]);

	// Create pending ticket mutation
	const createMutation = useMutation({
		mutationFn: createPendingTicket,
		onSuccess: () => {
			toast.success("Pending ticket created successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "pending-tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create pending ticket");
		},
	});

	const form = useForm({
		defaultValues: {
			attendee_name: "",
			attendee_email: "",
			attendee_phone: "",
			ticket_type_id: null as number | null,
			role: "",
			payment_status: PAYMENT_STATUS.PENDING,
			payment_method: "",
			transaction_id: "",
			payment_screenshot_url: "",
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

			await createMutation.mutateAsync({
				eventId,
				attendee_name: value.attendee_name,
				attendee_email: value.attendee_email.trim() || null,
				attendee_phone: value.attendee_phone || null,
				ticket_type_id: value.ticket_type_id,
				role: value.role || undefined,
				payment_status: value.payment_status,
				payment_screenshot_url: value.payment_screenshot_url || undefined,
				transaction_id: value.transaction_id || undefined,
				payment_method: value.payment_method || undefined,
				custom_fields_data:
					Object.keys(customFieldsData).length > 0
						? customFieldsData
						: undefined,
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
		<div className="px-4 md:px-6">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-8 md:space-y-16"
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
											disabled={createMutation.isPending}
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
											disabled={createMutation.isPending}
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
										disabled={createMutation.isPending}
									/>
								)}
							</form.Field>

							<form.Field name="role">
								{(field) => (
									<InputLabel
										label="Role"
										htmlFor={roleId}
										placeholder="e.g., VIP, Speaker, Staff"
										value={field.state.value}
										onChange={(value) => field.handleChange(value)}
										onBlur={field.handleBlur}
										disabled={createMutation.isPending}
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
									disabled={createMutation.isPending}
								/>
							)}
						</form.Field>
					</FormGroupContainer>

					<div className="flex flex-col gap-4">
						<FormGroupContainer
							title={{
								icon: CreditCard,
								label: "Payment Information",
								description: "Payment details for pending ticket verification",
							}}
						>
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
											disabled={createMutation.isPending}
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
											disabled={createMutation.isPending}
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
											disabled={createMutation.isPending}
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
											disabled={createMutation.isPending}
											description="URL to the payment screenshot (optional)"
										/>
									)}
								</form.Field>
							</div>
						</FormGroupContainer>

						<FormGroupContainer
							title={{
								icon: FileText,
								label: "Additional Information",
								description:
									"Fill in the additional information set by the event organizer for the ticket holder",
							}}
						>
							{customFields.length > 0 && (
								<div className="grid gap-4 md:grid-cols-3 2xl:grid-cols-5">
									{customFields.map((field) => (
										<InputLabel
											key={field.labelKey}
											label={field.labelName}
											placeholder={`Enter ${field.labelName.toLowerCase()}`}
											value={field.value}
											onChange={(value) =>
												updateCustomField(field.labelKey, value)
											}
											disabled={createMutation.isPending}
										/>
									))}
								</div>
							)}
						</FormGroupContainer>
					</div>
				</FieldSet>
				<FieldGroup className="mt-6 flex flex-col justify-end gap-2 md:mt-0 md:flex-row">
					<Button
						type="button"
						variant="outline"
						onClick={closeDialog}
						disabled={createMutation.isPending}
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
									createMutation.isPending
								}
								className="rounded-none py-6 md:py-4"
							>
								{createMutation.isPending
									? "Creating..."
									: "Create Pending Ticket"}
							</Button>
						)}
					</form.Subscribe>
				</FieldGroup>
			</form>
		</div>
	);
}
