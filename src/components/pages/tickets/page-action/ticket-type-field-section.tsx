"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, X } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { FieldSectionLabel } from "@/components/admin-ui/form/field-section-label";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { NumberInputLabel } from "@/components/admin-ui/form/number-input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { Button } from "@/components/ui/button";
import {
	createTicketType,
	getEventTicketTypes,
	getGlobalTicketTypes,
} from "@/lib/api/ticket-type";
import type { TicketType } from "@/lib/api/ticket-type/response";

interface TicketTypeField {
	state: {
		value: number | null;
		meta: {
			errors: (string | undefined)[];
		};
	};
	handleChange: (value: number) => void;
}

interface TicketTypeFieldSectionProps {
	field: TicketTypeField;
	eventId: string;
	disabled?: boolean;
}

export function TicketTypeFieldSection({
	field,
	eventId,
	disabled = false,
}: TicketTypeFieldSectionProps) {
	const ticketTypeSelectId = useId();
	const queryClient = useQueryClient();

	// Generate IDs for create form fields
	const createFormNameId = useId();
	const createFormPriceId = useId();
	const createFormQuantityId = useId();
	const createFormMaxPerOrderId = useId();

	// Internal state for "Create New Type" form visibility
	const [showCreateTicketType, setShowCreateTicketType] = useState(false);

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

	// Get selected ticket type for display
	const selectedTicketType = ticketTypes?.find(
		(t: TicketType) => t.id === field.state.value,
	);

	// Create ticket type mutation
	const createTicketTypeMutation = useMutation({
		mutationFn: createTicketType,
		onSuccess: (data) => {
			toast.success("Ticket type created successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "ticket-types"],
			});
			// Auto-select the newly created ticket type
			field.handleChange(data.id);
			// Reset form and hide create form
			createTicketTypeForm.reset();
			setShowCreateTicketType(false);
		},
		onError: (error: unknown) => {
			const message =
				error instanceof Error ? error.message : "Failed to create ticket type";
			toast.error(message);
		},
	});

	// TanStack Form for creating new ticket type
	const createTicketTypeForm = useForm({
		defaultValues: {
			name: "",
			price: 0,
			quantity: 1,
			max_per_order: 1,
		},
		onSubmit: async ({ value }) => {
			await createTicketTypeMutation.mutateAsync({
				eventId,
				name: value.name.trim(),
				price: value.price,
				quantity: value.quantity,
				max_per_order: value.max_per_order,
				status: "published",
			});
		},
	});

	const handleCancelCreate = () => {
		createTicketTypeForm.reset();
		setShowCreateTicketType(false);
	};

	return (
		<div className="h-full">
			{!showCreateTicketType ? (
				<div className="h-full rounded-none border bg-muted/50">
					<div className="flex flex-col items-center justify-between gap-4 border-border border-b p-4 md:flex-row md:gap-0">
						<FieldSectionLabel
							label="Selected Ticket Type"
							description="Select and view an existing ticket type or Create a new one"
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setShowCreateTicketType(true)}
							disabled={
								disabled ||
								createTicketTypeMutation.isPending ||
								isLoadingTicketTypes
							}
							className="w-full rounded-none py-6 md:w-auto md:py-4"
						>
							<Plus className="mr-2 size-4" />
							Create New Type
						</Button>
					</div>

					<div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
						<SelectLabel
							label="Select Ticket Type"
							htmlFor={ticketTypeSelectId}
							value={field.state.value ? field.state.value.toString() : ""}
							onChange={(value) =>
								field.handleChange(Number.parseInt(value, 10))
							}
							options={ticketTypes.map((ticketType: TicketType) => ({
								value: ticketType.id.toString(),
								label:
									ticketType.eventId === null
										? `${ticketType.name} (Default) (#${ticketType.id})`
										: `${ticketType.name} (#${ticketType.id})`,
							}))}
							errors={
								field.state.meta.errors.length > 0
									? field.state.meta.errors.map((error) => ({
											message: String(error),
										}))
									: undefined
							}
							isInvalid={field.state.meta.errors.length > 0}
							placeholder={
								isLoadingTicketTypes
									? "Loading ticket types..."
									: ticketTypes.length === 0
										? "No ticket types available - create one"
										: "Select a ticket type"
							}
							disabled={
								disabled ||
								isLoadingTicketTypes ||
								createTicketTypeMutation.isPending ||
								ticketTypes.length === 0
							}
							required
							emptyMessage="No ticket types available - create one"
							description={
								selectedTicketType?.eventId === null
									? "Default Ticket Type"
									: undefined
							}
							className="bg-background"
						/>

						<InputLabel
							label="Ticket Price"
							value={
								selectedTicketType
									? `RM${selectedTicketType.price.toFixed(2)}`
									: "-"
							}
							onChange={() => {}}
							disabled={true}
							className="bg-muted text-lg"
						/>

						<InputLabel
							label="Ticket Quantity"
							value={
								selectedTicketType
									? `${selectedTicketType.quantity} available`
									: "-"
							}
							onChange={() => {}}
							disabled={true}
							className="bg-muted"
						/>
					</div>
				</div>
			) : (
				<div className="space-y-4 rounded-none border bg-muted/50">
					<div className="flex items-center justify-between border-border border-b p-4">
						<FieldSectionLabel
							label="Create New Ticket Type"
							description="Create a new ticket type for this event directly."
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
						<createTicketTypeForm.Field
							name="name"
							validators={{
								onChange: ({ value }) => {
									if (!value.trim() || value.length < 1) {
										return "Ticket type name is required";
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
										label="Ticket Type Name"
										htmlFor={createFormNameId}
										value={field.state.value}
										onChange={field.handleChange}
										onBlur={field.handleBlur}
										errors={field.state.meta.errors.map((error) => ({
											message: String(error),
										}))}
										isInvalid={isInvalid}
										placeholder="e.g., VIP, General Admission"
										disabled={createTicketTypeMutation.isPending}
										required
										className="bg-background"
									/>
								);
							}}
						</createTicketTypeForm.Field>

						<createTicketTypeForm.Field
							name="price"
							validators={{
								onChange: ({ value }) => {
									if (value < 0 || Number.isNaN(value)) {
										return "Please enter a valid price (0 or more)";
									}
									return undefined;
								},
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<NumberInputLabel
										label="Price (RM)"
										htmlFor={createFormPriceId}
										value={field.state.value}
										onChange={field.handleChange}
										errors={field.state.meta.errors.map((error) => ({
											message: String(error),
										}))}
										isInvalid={isInvalid}
										min={0}
										max={10000000}
										step={0.01}
										placeholder="0.00"
										disabled={createTicketTypeMutation.isPending}
										required
										className="bg-background"
									/>
								);
							}}
						</createTicketTypeForm.Field>

						<createTicketTypeForm.Field
							name="quantity"
							validators={{
								onChange: ({ value }) => {
									if (!value || value < 1 || Number.isNaN(value)) {
										return "Please enter a valid quantity (1 or more)";
									}
									return undefined;
								},
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<NumberInputLabel
										label="Quantity Available"
										htmlFor={createFormQuantityId}
										value={field.state.value}
										onChange={field.handleChange}
										errors={field.state.meta.errors.map((error) => ({
											message: String(error),
										}))}
										isInvalid={isInvalid}
										min={1}
										max={10000000}
										step={1}
										placeholder="100"
										disabled={createTicketTypeMutation.isPending}
										required
										className="bg-background"
									/>
								);
							}}
						</createTicketTypeForm.Field>

						<createTicketTypeForm.Field
							name="max_per_order"
							validators={{
								onChange: ({ value }) => {
									if (!value || value < 1 || Number.isNaN(value)) {
										return "Please enter a valid max per order (1 or more)";
									}
									return undefined;
								},
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<NumberInputLabel
										label="Max Per Order"
										htmlFor={createFormMaxPerOrderId}
										value={field.state.value}
										onChange={field.handleChange}
										errors={field.state.meta.errors.map((error) => ({
											message: String(error),
										}))}
										isInvalid={isInvalid}
										min={1}
										max={10000000}
										step={1}
										placeholder="1"
										disabled={createTicketTypeMutation.isPending}
										required
										className="bg-background"
									/>
								);
							}}
						</createTicketTypeForm.Field>
					</div>

					<div className="flex flex-col justify-end gap-2 border-border border-t p-4 md:flex-row">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancelCreate}
							disabled={createTicketTypeMutation.isPending}
							size="sm"
							className="rounded-none py-6 md:py-4"
						>
							<X className="mr-2 size-4" />
							Cancel
						</Button>
						<createTicketTypeForm.Subscribe>
							{(state) => (
								<Button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										createTicketTypeForm.handleSubmit();
									}}
									disabled={
										!state.canSubmit ||
										state.isSubmitting ||
										createTicketTypeMutation.isPending
									}
									size="sm"
									className="rounded-none py-6 md:py-4"
								>
									<Check className="mr-2 size-4" />
									{createTicketTypeMutation.isPending
										? "Creating..."
										: "Create Ticket Type"}
								</Button>
							)}
						</createTicketTypeForm.Subscribe>
					</div>
				</div>
			)}
		</div>
	);
}
