"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
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
import { useDialog } from "@/hooks/use-dialog";
import { updatePendingTicket } from "@/lib/api/event/pending";
import { getEventById } from "@/lib/api/event";
import type { TicketType } from "@/lib/api/ticket-type";
import {
	getEventTicketTypes,
	getGlobalTicketTypes,
} from "@/lib/api/ticket-type";
import type { PendingTicket } from "../columns";
import {
	formatTicketPrice,
	getPaymentStatusNumber,
	PAYMENT_STATUS,
} from "../constants";

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

	// Form state - Initialize with ticket data
	const [attendeeName, setAttendeeName] = useState(ticket.name);
	const [attendeeEmail, setAttendeeEmail] = useState(ticket.email);
	const [attendeePhone, setAttendeePhone] = useState(ticket.phone || "");
	const [ticketTypeId, setTicketTypeId] = useState<number | null>(
		ticket.ticketTypeId || null,
	);
	const [paymentStatus, setPaymentStatus] = useState<number>(
		getPaymentStatusNumber(ticket.paymentStatus),
	);
	const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState(
		ticket.paymentScreenshotUrl || "",
	);
	const [transactionId, setTransactionId] = useState(
		ticket.transactionId || "",
	);
	const [paymentMethod, setPaymentMethod] = useState(
		ticket.paymentMethod || "",
	);
	const [customFields, setCustomFields] = useState<
		Array<{ labelKey: string; labelName: string; value: string }>
	>([]);

	// Validation errors
	const [errors, setErrors] = useState<Record<string, string>>({});

	const { data: eventData, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	// Fetch ticket types for this event
	const { data: eventTicketTypes, isLoading: isLoadingEventTicketTypes } =
		useQuery({
			queryKey: ["event", eventId, "ticket-types"],
			queryFn: () => getEventTicketTypes({ eventId }),
		});

	// Fetch global ticket types (fallback)
	const { data: globalTicketTypes, isLoading: isLoadingGlobalTicketTypes } =
		useQuery({
			queryKey: ["ticket-types", "global"],
			queryFn: () => getGlobalTicketTypes(),
			enabled:
				!isLoadingEventTicketTypes &&
				(!eventTicketTypes || eventTicketTypes.length === 0),
		});

	// Use event ticket types if available, otherwise use global ticket types
	const ticketTypes =
		eventTicketTypes && eventTicketTypes.length > 0
			? eventTicketTypes
			: globalTicketTypes || [];

	const isLoadingTicketTypes =
		isLoadingEventTicketTypes || isLoadingGlobalTicketTypes;

	useEffect(() => {
		if (eventData?.labels_data && Object.keys(eventData.labels_data).length > 0) {
			const fields = Object.entries(eventData.labels_data).map(([key, labelNameValue]) => {
				const currentLabelName = labelNameValue as string;
				const existingLabel = ticket.customLabels?.find(
					(label) => label.name === currentLabelName,
				);
				
				return {
					labelKey: key,
					labelName: currentLabelName,
					value: existingLabel?.value || "",
				};
			});
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

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validation
		const newErrors: Record<string, string> = {};

		if (!attendeeName.trim() || attendeeName.length < 2) {
			newErrors.attendeeName = "Name must be at least 2 characters";
		}

		if (!attendeeEmail.trim()) {
			newErrors.attendeeEmail = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeEmail)) {
			newErrors.attendeeEmail = "Please enter a valid email address";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		// Transform custom fields array to object
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
				attendee_name: attendeeName,
				attendee_email: attendeeEmail,
				attendee_phone: attendeePhone || undefined,
				ticket_type_id: ticketTypeId || undefined,
				payment_status: paymentStatus, // Send payment status as number
				payment_screenshot_url: paymentScreenshotUrl || undefined,
				transaction_id: transactionId || undefined,
				payment_method: paymentMethod || undefined,
				custom_fields_data:
					Object.keys(customFieldsData).length > 0
						? customFieldsData
						: undefined,
			});
		} catch {
			// Error is handled by onError callback
		}
	};

	const handleChange = (field: string, value: string | number) => {
		if (field === "attendeeName") setAttendeeName(value as string);
		if (field === "attendeeEmail") setAttendeeEmail(value as string);
		if (field === "attendeePhone") setAttendeePhone(value as string);
		if (field === "ticketTypeId") setTicketTypeId(value as number);
		if (field === "paymentStatus") setPaymentStatus(value as number);
		if (field === "paymentScreenshotUrl")
			setPaymentScreenshotUrl(value as string);
		if (field === "transactionId") setTransactionId(value as string);
		if (field === "paymentMethod") setPaymentMethod(value as string);

		// Clear error for this field when user starts typing
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	// Custom field handlers
	const updateCustomField = (labelKey: string, newValue: string) => {
		setCustomFields(
			customFields.map((field) =>
				field.labelKey === labelKey ? { ...field, value: newValue } : field,
			),
		);
	};

	const selectedTicketType = ticketTypes?.find(
		(t: TicketType) => t.id === ticketTypeId,
	);

	return (
		<div className="mx-auto w-full max-w-8xl px-8">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldSeparator />
					<FieldGroup>
						{/* Attendee Information Section */}
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold text-lg">Attendee Information</h3>
								<p className="text-muted-foreground text-sm">
									Update the details of the ticket holder
								</p>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<Field orientation="vertical">
									<FieldLabel>Full Name</FieldLabel>
									{errors.attendeeName && (
										<FieldError>{errors.attendeeName}</FieldError>
									)}
									<Input
										placeholder="John Doe"
										value={attendeeName}
										onChange={(e) =>
											handleChange("attendeeName", e.target.value)
										}
										required
										disabled={updateMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel>Email Address</FieldLabel>
									{errors.attendeeEmail && (
										<FieldError>{errors.attendeeEmail}</FieldError>
									)}
									<Input
										type="email"
										placeholder="john.doe@example.com"
										value={attendeeEmail}
										onChange={(e) =>
											handleChange("attendeeEmail", e.target.value)
										}
										required
										disabled={updateMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel>Phone Number</FieldLabel>
									{errors.attendeePhone && (
										<FieldError>{errors.attendeePhone}</FieldError>
									)}
									<Input
										type="tel"
										placeholder="+1 234 567 8900"
										value={attendeePhone}
										onChange={(e) =>
											handleChange("attendeePhone", e.target.value)
										}
										disabled={updateMutation.isPending}
									/>
								</Field>
							</div>
						</div>

						<FieldSeparator />

						{/* Ticket Information Section */}
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold text-lg">Ticket Information</h3>
								<p className="text-muted-foreground text-sm">
									Update ticket type and view current details
								</p>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<Field orientation="vertical">
									<FieldLabel>Ticket Type</FieldLabel>
									<Select
										value={ticketTypeId ? ticketTypeId.toString() : undefined}
										onValueChange={(value) =>
											handleChange("ticketTypeId", Number.parseInt(value, 10))
										}
										disabled={
											isLoadingTicketTypes ||
											updateMutation.isPending ||
											ticketTypes.length === 0
										}
									>
										<SelectTrigger>
											<SelectValue
												placeholder={
													isLoadingTicketTypes
														? "Loading ticket types..."
														: ticketTypes.length === 0
															? "No ticket types available"
															: "Select a ticket type"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{ticketTypes?.map((ticketType: TicketType) => (
												<SelectItem
													key={ticketType.id}
													value={ticketType.id.toString()}
												>
													<div className="flex w-full items-center justify-between gap-4">
														<span className="font-medium">
															{ticketType.name}
														</span>
														<span className="text-muted-foreground text-sm">
															{ticketType.eventId === null && "Default"}
														</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{selectedTicketType?.eventId === null && (
										<FieldDescription>Default Ticket Type</FieldDescription>
									)}
								</Field>

								<Field orientation="vertical">
									<FieldLabel>Ticket Price</FieldLabel>
									<div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2">
										<span className="text-lg">
											{selectedTicketType
												? `$${selectedTicketType.price.toFixed(2)}`
												: formatTicketPrice(ticket.value)}
										</span>
									</div>
								</Field>

								<Field orientation="vertical">
									<FieldLabel>Ticket Quantity</FieldLabel>
									<div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2">
										<span>
											{selectedTicketType
												? `${selectedTicketType.quantity} available`
												: "N/A"}
										</span>
									</div>
								</Field>
							</div>
						</div>

						<FieldSeparator />

						{/* Payment Information Section */}
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold text-lg">Payment Information</h3>
								<p className="text-muted-foreground text-sm">
									Payment details for pending ticket verification
								</p>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Field orientation="vertical">
									<FieldLabel>Payment Status</FieldLabel>
									<Select
										value={paymentStatus.toString()}
										onValueChange={(value) =>
											handleChange("paymentStatus", Number.parseInt(value, 10))
										}
										disabled={updateMutation.isPending}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select payment status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={PAYMENT_STATUS.PENDING.toString()}>
												Pending
											</SelectItem>
											<SelectItem value={PAYMENT_STATUS.PAID.toString()}>
												Paid
											</SelectItem>
											<SelectItem value={PAYMENT_STATUS.FAILED.toString()}>
												Failed
											</SelectItem>
											<SelectItem
												value={PAYMENT_STATUS.REFUNDED_PAYMENT.toString()}
											>
												Refunded Payment
											</SelectItem>
										</SelectContent>
									</Select>
									<FieldDescription>
										Current status of the payment
									</FieldDescription>
								</Field>

								<Field orientation="vertical">
									<FieldLabel>Payment Method</FieldLabel>
									<Input
										placeholder="e.g., Bank Transfer, Credit Card"
										value={paymentMethod}
										onChange={(e) =>
											handleChange("paymentMethod", e.target.value)
										}
										disabled={updateMutation.isPending}
									/>
									<FieldDescription>
										Method used for payment (optional)
									</FieldDescription>
								</Field>

								<Field orientation="vertical">
									<FieldLabel>Transaction ID</FieldLabel>
									<Input
										placeholder="TXN123456789"
										value={transactionId}
										onChange={(e) =>
											handleChange("transactionId", e.target.value)
										}
										disabled={updateMutation.isPending}
									/>
									<FieldDescription>
										Transaction ID from payment provider (optional)
									</FieldDescription>
								</Field>

								<Field orientation="vertical">
									<FieldLabel>Payment Screenshot URL</FieldLabel>
									<Input
										placeholder="https://example.com/screenshot.jpg"
										value={paymentScreenshotUrl}
										onChange={(e) =>
											handleChange("paymentScreenshotUrl", e.target.value)
										}
										disabled={updateMutation.isPending}
									/>
									<FieldDescription>
										URL to the payment screenshot (optional)
									</FieldDescription>
								</Field>
							</div>
						</div>

						<FieldSeparator />

						{/* Custom Fields Section */}
						<div className="space-y-4">
							<div>
								<h3 className="font-semibold text-lg">Custom Labels</h3>
								<p className="text-muted-foreground text-sm">
									{isLoadingEvent
										? "Loading custom labels..."
										: customFields.length > 0
											? "Update the custom labels configured for this event"
											: "No custom labels configured for this event"}
								</p>
							</div>

							{customFields.length > 0 && (
								<div className="grid gap-4 md:grid-cols-2">
									{customFields.map((field) => (
										<Field key={field.labelKey} orientation="vertical">
											<FieldLabel>{field.labelName}</FieldLabel>
											<Input
												placeholder={`Enter ${field.labelName.toLowerCase()}`}
												value={field.value}
												onChange={(e) =>
													updateCustomField(field.labelKey, e.target.value)
												}
												disabled={updateMutation.isPending}
											/>
										</Field>
									))}
								</div>
							)}
						</div>

						<FieldSeparator />

						{/* Submit Buttons - Right Aligned */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={closeDialog}
								disabled={updateMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateMutation.isPending}>
								{updateMutation.isPending
									? "Updating..."
									: "Update Pending Ticket"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
