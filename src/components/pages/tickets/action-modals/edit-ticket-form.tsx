"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/data-state";
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
	const [attendeeEmail, setAttendeeEmail] = useState(ticket.email);
	const [attendeePhone, setAttendeePhone] = useState(ticket.phone || "");
	const [ticketTypeId, setTicketTypeId] = useState<number | null>(
		ticket.ticketTypeId || null,
	);
	const [customFields, setCustomFields] = useState<
		Array<{ id: string; key: string; value: string }>
	>(
		ticket.customLabels?.map((label) => ({
			id: crypto.randomUUID(),
			key: label.name,
			value: label.value,
		})) || [],
	);

	// Validation errors
	const [errors, setErrors] = useState<Record<string, string>>({});

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

		// Transform custom fields array to object
		const customFieldsData: Record<string, string> = {};
		customFields.forEach((field) => {
			if (field.key.trim() && field.value.trim()) {
				customFieldsData[field.key] = field.value;
			}
		});

		if (!ticketTypeId) {
			setErrors({ ...errors, ticketTypeId: "Please select a ticket type" });
			return;
		}

		try {
			await updateTicketMutation.mutateAsync({
				eventId,
				ticketId: ticket.id,
				attendee_name: attendeeName,
				attendee_email: attendeeEmail,
				attendee_phone: attendeePhone || undefined,
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
	const addCustomField = () => {
		if (customFields.length < 10) {
			setCustomFields([
				...customFields,
				{ id: crypto.randomUUID(), key: "", value: "" },
			]);
		}
	};

	const removeCustomField = (id: string) => {
		setCustomFields(customFields.filter((field) => field.id !== id));
	};

	const updateCustomField = (
		id: string,
		type: "key" | "value",
		newValue: string,
	) => {
		setCustomFields(
			customFields.map((field) =>
				field.id === id ? { ...field, [type]: newValue } : field,
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
									required
									disabled={updateTicketMutation.isPending}
								/>
								<FieldDescription>
									Email address of the ticket holder
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
														${ticketType.price.toFixed(2)}
														{usingGlobalTypes && " (Global)"}
													</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{selectedTicketType && (
									<FieldDescription>
										${selectedTicketType.price.toFixed(2)} |{" "}
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
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold text-lg">Custom Fields</h3>
									<p className="text-muted-foreground text-sm">
										Add optional custom fields for additional ticket information
									</p>
								</div>
								{customFields.length > 0 && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addCustomField}
										disabled={
											customFields.length >= 10 ||
											updateTicketMutation.isPending
										}
									>
										<Plus className="mr-2 size-4" />
										Add Custom Field ({customFields.length}/10)
									</Button>
								)}
							</div>

							{customFields.length > 0 ? (
								<div className="grid gap-4 md:grid-cols-2">
									{customFields.map((field) => (
										<div
											key={field.id}
											className="space-y-4 rounded-lg border p-4"
										>
											<div className="flex items-center justify-between">
												<span className="font-medium text-sm">
													Custom Field
												</span>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => removeCustomField(field.id)}
													disabled={updateTicketMutation.isPending}
													className="size-8 text-destructive hover:bg-destructive/10"
												>
													<Trash2 className="size-4" />
												</Button>
											</div>
											<div className="space-y-3">
												<div className="space-y-2">
													<FieldLabel className="text-xs">
														Field Name
													</FieldLabel>
													<Input
														placeholder="e.g., Dietary Preference"
														value={field.key}
														onChange={(e) =>
															updateCustomField(field.id, "key", e.target.value)
														}
														disabled={updateTicketMutation.isPending}
													/>
												</div>
												<div className="space-y-2">
													<FieldLabel className="text-xs">
														Field Value
													</FieldLabel>
													<Input
														placeholder="e.g., Vegetarian"
														value={field.value}
														onChange={(e) =>
															updateCustomField(
																field.id,
																"value",
																e.target.value,
															)
														}
														disabled={updateTicketMutation.isPending}
													/>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<EmptyState
									title="No custom fields"
									description="Click 'Add Custom Field' to add additional information"
									icon={<FileText className="size-8" />}
									height="h-auto"
									action={
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={addCustomField}
											disabled={updateTicketMutation.isPending}
										>
											<Plus className="mr-2 size-4" />
											Add Custom Field
										</Button>
									}
								/>
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
