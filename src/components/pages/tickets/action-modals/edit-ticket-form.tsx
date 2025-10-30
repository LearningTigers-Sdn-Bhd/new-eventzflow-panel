"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { getEventById } from "@/lib/api/event";
import { updateTicket } from "@/lib/api/ticket";
import {
	getEventTicketTypes,
	getGlobalTicketTypes,
} from "@/lib/api/ticket-type";
import type { TicketType } from "@/lib/api/ticket-type/response";
import type { BaseTicket } from "../columns";

interface EditTicketFormProps {
	ticket: BaseTicket;
}

export default function EditTicketForm({ ticket }: EditTicketFormProps) {
	const { closeDialog } = useDialog();
	const params = useParams();
	const eventId = params.event_id as string;
	const queryClient = useQueryClient();

	// Form state - Initialize with ticket data
	const [attendeeName, setAttendeeName] = useState(ticket.name);
	const [attendeeEmail, setAttendeeEmail] = useState<string>(
		ticket.email ?? "",
	);
	const [attendeePhone, setAttendeePhone] = useState(ticket.phone || "");
	const [ticketTypeId, setTicketTypeId] = useState<number | null>(
		ticket.ticketTypeId || null,
	);
	const [customFields, setCustomFields] = useState<
		Array<{ labelKey: string; labelName: string; value: string }>
	>([]);

	// Validation errors
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Fetch event details to get labels_data
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

	const usingGlobalTypes =
		!eventTicketTypes ||
		(eventTicketTypes.length === 0 && ticketTypes.length > 0);

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

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Validation
		const newErrors: Record<string, string> = {};

		if (!attendeeName.trim() || attendeeName.length < 2) {
			newErrors.attendeeName = "Name must be at least 2 characters";
		}

		if (
			attendeeEmail.trim() &&
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeEmail)
		) {
			newErrors.attendeeEmail = "Please enter a valid email address";
		}

		if (!ticketTypeId || ticketTypeId <= 0) {
			newErrors.ticketTypeId = "Please select a ticket type";
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

		if (!ticketTypeId) {
			setErrors({ ...errors, ticketTypeId: "Please select a ticket type" });
			return;
		}

		try {
			await updateTicketMutation.mutateAsync({
				eventId,
				ticketId: ticket.publicId,
				attendee_name: attendeeName,
				attendee_email: attendeeEmail.trim() || null,
				attendee_phone: attendeePhone || null,
				ticket_type_id: ticketTypeId,
				custom_fields_data:
					Object.keys(customFieldsData).length > 0
						? customFieldsData
						: undefined,
			});
		} catch (_error) {
			// Error is handled by onError callback
		}
	};

	const handleChange = (field: string, value: string | number) => {
		if (field === "attendeeName") setAttendeeName(value as string);
		if (field === "attendeeEmail") setAttendeeEmail(value as string);
		if (field === "attendeePhone") setAttendeePhone(value as string);
		if (field === "ticketTypeId") setTicketTypeId(value as number);

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
						{/* Attendee Name, Email, Phone, and Ticket Type - Two Rows */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<Field orientation="vertical">
								<FieldLabel>Attendee Name</FieldLabel>
								{errors.attendeeName && (
									<FieldError>{errors.attendeeName}</FieldError>
								)}
								<Input
									placeholder="John Doe"
									value={attendeeName}
									onChange={(e) => handleChange("attendeeName", e.target.value)}
									required
									disabled={updateTicketMutation.isPending}
								/>
								<FieldDescription>
									Full name of the ticket holder
								</FieldDescription>
							</Field>

							<Field orientation="vertical">
								<FieldLabel>Attendee Email</FieldLabel>
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
									disabled={updateTicketMutation.isPending}
								/>
								<FieldDescription>
									Email address of the ticket holder (optional)
								</FieldDescription>
							</Field>

							<Field orientation="vertical">
								<FieldLabel>Attendee Phone</FieldLabel>
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
									disabled={updateTicketMutation.isPending}
								/>
								<FieldDescription>
									Phone number of the ticket holder (optional)
								</FieldDescription>
							</Field>

							<Field orientation="vertical">
								<FieldLabel>Ticket Type</FieldLabel>
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
										updateTicketMutation.isPending ||
										ticketTypes.length === 0
									}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={
												isLoadingTicketTypes
													? "Loading..."
													: ticketTypes.length === 0
														? "No types available"
														: "Select type"
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{ticketTypes?.map((ticketType: TicketType) => (
											<SelectItem
												key={ticketType.id}
												value={ticketType.id.toString()}
											>
												<div className="flex items-center justify-between gap-4">
													<span className="font-medium">{ticketType.name}</span>
													<span className="text-muted-foreground text-sm">
														RM{ticketType.price.toFixed(2)}
														{usingGlobalTypes && " (Global)"}
													</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{selectedTicketType && (
									<FieldDescription>
										RM{selectedTicketType.price.toFixed(2)} |{" "}
										{selectedTicketType.quantity} available
										{usingGlobalTypes && " (Global)"}
									</FieldDescription>
								)}
								{!selectedTicketType && ticketTypes.length > 0 && (
									<FieldDescription>
										{usingGlobalTypes
											? "Using global types"
											: "Select ticket type"}
									</FieldDescription>
								)}
								{ticketTypes.length === 0 && !isLoadingTicketTypes && (
									<FieldError>No ticket types available</FieldError>
								)}
							</Field>
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
												disabled={updateTicketMutation.isPending}
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
								disabled={updateTicketMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={
									updateTicketMutation.isPending ||
									isLoadingTicketTypes ||
									ticketTypes.length === 0
								}
							>
								{updateTicketMutation.isPending
									? "Updating..."
									: "Update Ticket"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
