"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
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
import { createTicketType } from "@/lib/api/ticket-type";

interface CreateTicketTypeFormProps {
	eventId: string;
	onClose: () => void;
}

export function CreateTicketTypeForm({ eventId, onClose }: CreateTicketTypeFormProps) {
	const nameId = useId();
	const priceId = useId();
	const quantityId = useId();
	const maxPerOrderId = useId();
	const statusId = useId();

	const [formData, setFormData] = useState({
		name: "",
		price: "",
		quantity: "",
		max_per_order: "10",
		status: "draft" as "draft" | "published" | "archived",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const queryClient = useQueryClient();
	const createMutation = useMutation({
		mutationFn: createTicketType,
		onSuccess: () => {
			toast.success("Ticket type created successfully!");
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "ticket-types"] });
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create ticket type");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const newErrors: Record<string, string> = {};

		if (!formData.name || formData.name.length < 1) {
			newErrors.name = "Name is required";
		}

		const price = Number.parseFloat(formData.price);
		if (Number.isNaN(price) || price < 0) {
			newErrors.price = "Price must be a valid positive number";
		}

		const quantity = Number.parseInt(formData.quantity, 10);
		if (Number.isNaN(quantity) || quantity < 0) {
			newErrors.quantity = "Quantity must be a valid positive number";
		}

		const maxPerOrder = Number.parseInt(formData.max_per_order, 10);
		if (Number.isNaN(maxPerOrder) || maxPerOrder < 1) {
			newErrors.max_per_order = "Max per order must be at least 1";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		createMutation.mutate({
			eventId,
			name: formData.name,
			price,
			quantity,
			max_per_order: maxPerOrder,
			status: formData.status,
		});
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	return (
		<div className="w-full">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldSeparator />
					<FieldGroup>
						<Field orientation="vertical">
							<FieldLabel htmlFor={nameId}>Name</FieldLabel>
							{errors.name && <FieldError>{errors.name}</FieldError>}
							<Input
								id={nameId}
								placeholder="VIP Ticket"
								value={formData.name}
								onChange={(e) => handleChange("name", e.target.value)}
								required
								disabled={createMutation.isPending}
							/>
						</Field>

						<FieldSeparator />

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Field orientation="vertical">
								<FieldLabel htmlFor={priceId}>Price</FieldLabel>
								{errors.price && <FieldError>{errors.price}</FieldError>}
								<Input
									id={priceId}
									type="number"
									step="0.01"
									min="0"
									placeholder="0.00"
									value={formData.price}
									onChange={(e) => handleChange("price", e.target.value)}
									required
									disabled={createMutation.isPending}
								/>
							</Field>

							<Field orientation="vertical">
								<FieldLabel htmlFor={quantityId}>Quantity</FieldLabel>
								{errors.quantity && <FieldError>{errors.quantity}</FieldError>}
								<Input
									id={quantityId}
									type="number"
									min="0"
									placeholder="100"
									value={formData.quantity}
									onChange={(e) => handleChange("quantity", e.target.value)}
									required
									disabled={createMutation.isPending}
								/>
							</Field>
						</div>

						<FieldSeparator />

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<Field orientation="vertical">
								<FieldLabel htmlFor={maxPerOrderId}>Max Per Order</FieldLabel>
								{errors.max_per_order && <FieldError>{errors.max_per_order}</FieldError>}
								<Input
									id={maxPerOrderId}
									type="number"
									min="1"
									placeholder="10"
									value={formData.max_per_order}
									onChange={(e) => handleChange("max_per_order", e.target.value)}
									required
									disabled={createMutation.isPending}
								/>
							</Field>

							<Field orientation="vertical">
								<FieldLabel htmlFor={statusId}>Status</FieldLabel>
								<Select
									value={formData.status}
									onValueChange={(value) => handleChange("status", value)}
									disabled={createMutation.isPending}
								>
									<SelectTrigger id={statusId}>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="draft">Draft</SelectItem>
										<SelectItem value="published">Published</SelectItem>
										<SelectItem value="archived">Archived</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						</div>

						<FieldSeparator />

						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={createMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending ? "Creating..." : "Create Ticket Type"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
