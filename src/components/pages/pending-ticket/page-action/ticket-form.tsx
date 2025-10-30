"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useId, useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDialog } from "@/hooks/use-dialog";
import { createPendingTicket } from "@/lib/api/event/pending";
import { getEventById } from "@/lib/api/event";
import type { TicketType } from "@/lib/api/ticket-type";
import {
	createTicketType,
	getEventTicketTypes,
	getGlobalTicketTypes,
} from "@/lib/api/ticket-type";
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
	const ticketTypeSelectId = useId();
	const paymentStatusId = useId();
	const screenshotUrlId = useId();
	const transactionIdId = useId();
	const paymentMethodId = useId();

	// Form state
	const [attendeeName, setAttendeeName] = useState("");
	const [attendeeEmail, setAttendeeEmail] = useState("");
	const [attendeePhone, setAttendeePhone] = useState("");
	const [ticketTypeId, setTicketTypeId] = useState<number | null>(null);
	const [paymentStatus, setPaymentStatus] = useState<number>(
		PAYMENT_STATUS.PENDING,
	);
	const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState("");
	const [transactionId, setTransactionId] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("");
	const [customFields, setCustomFields] = useState<
		Array<{ labelKey: string; labelName: string; value: string }>
	>([]);

	// Ticket type creation state
	const [showCreateTicketType, setShowCreateTicketType] = useState(false);
	const [newTicketTypeName, setNewTicketTypeName] = useState("");
	const [newTicketTypePrice, setNewTicketTypePrice] = useState("");
	const [newTicketTypeQuantity, setNewTicketTypeQuantity] = useState("");
	const [newTicketTypeMaxPerOrder, setNewTicketTypeMaxPerOrder] = useState("1");

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
			const fields = Object.entries(eventData.labels_data).map(([key, value]) => ({
				labelKey: key,
				labelName: value as string,
				value: "",
			}));
			setCustomFields(fields);
		}
	}, [eventData]);

	// Create ticket type mutation
	const createTicketTypeMutation = useMutation({
		mutationFn: createTicketType,
		onSuccess: (data) => {
			toast.success("Ticket type created successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "ticket-types"],
			});
			// Auto-select the newly created ticket type
			setTicketTypeId(data.id);
			// Reset form
			setShowCreateTicketType(false);
			setNewTicketTypeName("");
			setNewTicketTypePrice("");
			setNewTicketTypeQuantity("");
			setNewTicketTypeMaxPerOrder("1");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create ticket type");
		},
	});

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

		if (!ticketTypeId || ticketTypeId <= 0) {
			newErrors.ticketTypeId = "Please select a ticket type";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		// Early return if no valid ticketTypeId (should never happen due to validation above)
		if (!ticketTypeId) {
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
			await createMutation.mutateAsync({
				eventId,
				attendee_name: attendeeName,
				attendee_email: attendeeEmail,
				attendee_phone: attendeePhone || undefined,
				ticket_type_id: ticketTypeId,
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

	// Handle ticket type creation
	const handleCreateTicketType = async () => {
		const newErrors: Record<string, string> = {};

		if (!newTicketTypeName.trim()) {
			newErrors.newTicketTypeName = "Ticket type name is required";
		}

		const price = Number.parseFloat(newTicketTypePrice);
		if (!newTicketTypePrice || Number.isNaN(price) || price < 0) {
			newErrors.newTicketTypePrice = "Please enter a valid price (0 or more)";
		}

		const quantity = Number.parseInt(newTicketTypeQuantity, 10);
		if (!newTicketTypeQuantity || Number.isNaN(quantity) || quantity < 1) {
			newErrors.newTicketTypeQuantity =
				"Please enter a valid quantity (1 or more)";
		}

		const maxPerOrder = Number.parseInt(newTicketTypeMaxPerOrder, 10);
		if (
			!newTicketTypeMaxPerOrder ||
			Number.isNaN(maxPerOrder) ||
			maxPerOrder < 1
		) {
			newErrors.newTicketTypeMaxPerOrder =
				"Please enter a valid max per order (1 or more)";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		await createTicketTypeMutation.mutateAsync({
			eventId,
			name: newTicketTypeName,
			price: Number.parseFloat(newTicketTypePrice),
			quantity: Number.parseInt(newTicketTypeQuantity, 10),
			max_per_order: Number.parseInt(newTicketTypeMaxPerOrder, 10),
			status: "published",
		});
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
									Enter the details of the ticket holder
								</p>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<Field orientation="vertical">
									<FieldLabel htmlFor={nameId}>Full Name</FieldLabel>
									{errors.attendeeName && (
										<FieldError>{errors.attendeeName}</FieldError>
									)}
									<Input
										id={nameId}
										placeholder="John Doe"
										value={attendeeName}
										onChange={(e) =>
											handleChange("attendeeName", e.target.value)
										}
										required
										disabled={createMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={emailId}>Email Address</FieldLabel>
									{errors.attendeeEmail && (
										<FieldError>{errors.attendeeEmail}</FieldError>
									)}
									<Input
										id={emailId}
										type="email"
										placeholder="john.doe@example.com"
										value={attendeeEmail}
										onChange={(e) =>
											handleChange("attendeeEmail", e.target.value)
										}
										required
										disabled={createMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={phoneId}>Phone Number</FieldLabel>
									{errors.attendeePhone && (
										<FieldError>{errors.attendeePhone}</FieldError>
									)}
									<Input
										id={phoneId}
										type="tel"
										placeholder="+1 234 567 8900"
										value={attendeePhone}
										onChange={(e) =>
											handleChange("attendeePhone", e.target.value)
										}
										disabled={createMutation.isPending}
									/>
								</Field>
							</div>
						</div>

						<FieldSeparator />

						{/* Ticket Type Section */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold text-lg">Ticket Type</h3>
									<p className="text-muted-foreground text-sm">
										Select an existing ticket type or create a new one
									</p>
								</div>
								{!showCreateTicketType && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => setShowCreateTicketType(true)}
										disabled={
											createMutation.isPending ||
											createTicketTypeMutation.isPending
										}
									>
										<Plus className="mr-2 size-4" />
										Create New Type
									</Button>
								)}
							</div>

							{!showCreateTicketType ? (
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<Field orientation="vertical">
										<FieldLabel htmlFor={ticketTypeSelectId}>
											Select Ticket Type
										</FieldLabel>
										{errors.ticketTypeId && (
											<FieldError>{errors.ticketTypeId}</FieldError>
										)}
										<Select
											value={ticketTypeId ? ticketTypeId.toString() : undefined}
											onValueChange={(value) =>
												handleChange("ticketTypeId", Number.parseInt(value, 10))
											}
											disabled={
												isLoadingTicketTypes ||
												createMutation.isPending ||
												ticketTypes.length === 0
											}
										>
											<SelectTrigger id={ticketTypeSelectId}>
												<SelectValue
													placeholder={
														isLoadingTicketTypes
															? "Loading ticket types..."
															: ticketTypes.length === 0
																? "No ticket types available - create one"
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
													: "-"}
											</span>
										</div>
									</Field>

									<Field orientation="vertical">
										<FieldLabel>Ticket Quantity</FieldLabel>
										<div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2">
											<span>
												{selectedTicketType
													? `${selectedTicketType.quantity} available`
													: "-"}
											</span>
										</div>
									</Field>
								</div>
							) : (
								<div className="space-y-4 rounded-lg border bg-muted/50 p-4">
									<div className="flex items-center justify-between">
										<Label className="font-semibold">
											Create New Ticket Type
										</Label>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => {
												setShowCreateTicketType(false);
												setNewTicketTypeName("");
												setNewTicketTypePrice("");
												setNewTicketTypeQuantity("");
												setNewTicketTypeMaxPerOrder("1");
												// Clear errors
												setErrors((prev) => {
													const newErrors = { ...prev };
													delete newErrors.newTicketTypeName;
													delete newErrors.newTicketTypePrice;
													delete newErrors.newTicketTypeQuantity;
													delete newErrors.newTicketTypeMaxPerOrder;
													return newErrors;
												});
											}}
											disabled={createTicketTypeMutation.isPending}
										>
											Cancel
										</Button>
									</div>

									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<Field orientation="vertical">
											<FieldLabel>Ticket Type Name</FieldLabel>
											{errors.newTicketTypeName && (
												<FieldError>{errors.newTicketTypeName}</FieldError>
											)}
											<Input
												placeholder="e.g., VIP, General Admission"
												value={newTicketTypeName}
												onChange={(e) => {
													setNewTicketTypeName(e.target.value);
													if (errors.newTicketTypeName) {
														setErrors((prev) => {
															const newErrors = { ...prev };
															delete newErrors.newTicketTypeName;
															return newErrors;
														});
													}
												}}
												disabled={createTicketTypeMutation.isPending}
											/>
										</Field>

										<Field orientation="vertical">
											<FieldLabel>Price ($)</FieldLabel>
											{errors.newTicketTypePrice && (
												<FieldError>{errors.newTicketTypePrice}</FieldError>
											)}
											<Input
												type="number"
												step="0.01"
												min="0"
												placeholder="0.00"
												value={newTicketTypePrice}
												onChange={(e) => {
													setNewTicketTypePrice(e.target.value);
													if (errors.newTicketTypePrice) {
														setErrors((prev) => {
															const newErrors = { ...prev };
															delete newErrors.newTicketTypePrice;
															return newErrors;
														});
													}
												}}
												disabled={createTicketTypeMutation.isPending}
											/>
										</Field>

										<Field orientation="vertical">
											<FieldLabel>Quantity Available</FieldLabel>
											{errors.newTicketTypeQuantity && (
												<FieldError>{errors.newTicketTypeQuantity}</FieldError>
											)}
											<Input
												type="number"
												min="1"
												placeholder="100"
												value={newTicketTypeQuantity}
												onChange={(e) => {
													setNewTicketTypeQuantity(e.target.value);
													if (errors.newTicketTypeQuantity) {
														setErrors((prev) => {
															const newErrors = { ...prev };
															delete newErrors.newTicketTypeQuantity;
															return newErrors;
														});
													}
												}}
												disabled={createTicketTypeMutation.isPending}
											/>
										</Field>

										<Field orientation="vertical">
											<FieldLabel>Max Per Order</FieldLabel>
											{errors.newTicketTypeMaxPerOrder && (
												<FieldError>
													{errors.newTicketTypeMaxPerOrder}
												</FieldError>
											)}
											<Input
												type="number"
												min="1"
												placeholder="1"
												value={newTicketTypeMaxPerOrder}
												onChange={(e) => {
													setNewTicketTypeMaxPerOrder(e.target.value);
													if (errors.newTicketTypeMaxPerOrder) {
														setErrors((prev) => {
															const newErrors = { ...prev };
															delete newErrors.newTicketTypeMaxPerOrder;
															return newErrors;
														});
													}
												}}
												disabled={createTicketTypeMutation.isPending}
											/>
										</Field>
									</div>

									<div className="flex justify-end">
										<Button
											type="button"
											onClick={handleCreateTicketType}
											disabled={createTicketTypeMutation.isPending}
											size="sm"
										>
											<Check className="mr-2 size-4" />
											{createTicketTypeMutation.isPending
												? "Creating..."
												: "Create Ticket Type"}
										</Button>
									</div>
								</div>
							)}
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
									<FieldLabel htmlFor={paymentStatusId}>
										Payment Status
									</FieldLabel>
									<Select
										value={paymentStatus.toString()}
										onValueChange={(value) =>
											handleChange("paymentStatus", Number.parseInt(value, 10))
										}
										disabled={createMutation.isPending}
									>
										<SelectTrigger id={paymentStatusId}>
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
									<FieldLabel htmlFor={paymentMethodId}>
										Payment Method
									</FieldLabel>
									<Input
										id={paymentMethodId}
										placeholder="e.g., Bank Transfer, Credit Card"
										value={paymentMethod}
										onChange={(e) =>
											handleChange("paymentMethod", e.target.value)
										}
										disabled={createMutation.isPending}
									/>
									<FieldDescription>
										Method used for payment (optional)
									</FieldDescription>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={transactionIdId}>
										Transaction ID
									</FieldLabel>
									<Input
										id={transactionIdId}
										placeholder="TXN123456789"
										value={transactionId}
										onChange={(e) =>
											handleChange("transactionId", e.target.value)
										}
										disabled={createMutation.isPending}
									/>
									<FieldDescription>
										Transaction ID from payment provider (optional)
									</FieldDescription>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={screenshotUrlId}>
										Payment Screenshot URL
									</FieldLabel>
									<Input
										id={screenshotUrlId}
										placeholder="https://example.com/screenshot.jpg"
										value={paymentScreenshotUrl}
										onChange={(e) =>
											handleChange("paymentScreenshotUrl", e.target.value)
										}
										disabled={createMutation.isPending}
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
											? "Fill in the custom labels configured for this event"
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
												disabled={createMutation.isPending}
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
								disabled={createMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={
									createMutation.isPending ||
									isLoadingTicketTypes ||
									ticketTypes.length === 0
								}
							>
								{createMutation.isPending
									? "Creating..."
									: "Create Pending Ticket"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
