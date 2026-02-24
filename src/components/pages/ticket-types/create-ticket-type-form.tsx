"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { SelectLabel } from "@/components/admin-ui/form/select-label";
import { Button } from "@/components/ui/button";
import { createTicketType } from "@/lib/api/ticket-type";

interface CreateTicketTypeFormProps {
	eventId: string;
	onClose: () => void;
}

export function CreateTicketTypeForm({
	eventId,
	onClose,
}: CreateTicketTypeFormProps) {
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
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "ticket-types"],
			});
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

		const priceNum = Number.parseFloat(formData.price) || 0;
		if (priceNum < 0) {
			newErrors.price = "Price must be a valid positive number";
		}

		const quantityNum = Number.parseInt(formData.quantity) || 0;
		if (quantityNum < 0) {
			newErrors.quantity = "Quantity must be a valid positive number";
		}

		const maxPerOrderNum = Number.parseInt(formData.max_per_order) || 1;
		if (maxPerOrderNum < 1) {
			newErrors.max_per_order = "Max per order must be at least 1";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		createMutation.mutate({
			eventId,
			name: formData.name,
			price: priceNum,
			quantity: quantityNum,
			max_per_order: maxPerOrderNum,
			status: formData.status,
		});
	};

	const handleChange = (field: string, value: string | number) => {
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
		<div className="h-full w-full p-0 md:p-4">
			<form onSubmit={handleSubmit} className="h-full">
				<div className="flex h-full flex-col justify-between gap-8">
					<div className="space-y-6">
						<InputLabel
							label="Name"
							htmlFor={nameId}
							value={formData.name}
							onChange={(value) => handleChange("name", value)}
							errors={errors.name ? [{ message: errors.name }] : undefined}
							isInvalid={!!errors.name}
							placeholder="VIP Ticket"
							required
							disabled={createMutation.isPending}
						/>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InputLabel
								label="Price"
								htmlFor={priceId}
								value={formData.price}
								onChange={(value) => handleChange("price", value)}
								errors={errors.price ? [{ message: errors.price }] : undefined}
								isInvalid={!!errors.price}
								type="input"
								inputMode="decimal"
								placeholder="0.00"
								required
								disabled={createMutation.isPending}
							/>

							<InputLabel
								label="Quantity"
								htmlFor={quantityId}
								value={formData.quantity}
								onChange={(value) => handleChange("quantity", value)}
								errors={
									errors.quantity ? [{ message: errors.quantity }] : undefined
								}
								isInvalid={!!errors.quantity}
								type="input"
								inputMode="numeric"
								placeholder="100"
								required
								disabled={createMutation.isPending}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InputLabel
								label="Max Per Order"
								htmlFor={maxPerOrderId}
								value={formData.max_per_order}
								onChange={(value) => handleChange("max_per_order", value)}
								errors={
									errors.max_per_order
										? [{ message: errors.max_per_order }]
										: undefined
								}
								isInvalid={!!errors.max_per_order}
								type="input"
								inputMode="numeric"
								placeholder="10"
								required
								disabled={createMutation.isPending}
							/>

							<SelectLabel
								label="Status"
								htmlFor={statusId}
								value={formData.status}
								onChange={(value) => handleChange("status", value)}
								options={[
									{ value: "draft", label: "Draft" },
									{ value: "published", label: "Published" },
									{ value: "archived", label: "Archived" },
								]}
								placeholder="Select status"
								required
								disabled={createMutation.isPending}
							/>
						</div>
					</div>
					<div className="flex w-full flex-col gap-2 md:flex-row md:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={createMutation.isPending}
							className="rounded-none py-6 md:py-4"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={createMutation.isPending}
							className="rounded-none py-6 md:py-4"
						>
							{createMutation.isPending ? "Creating..." : "Create Ticket Type"}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
