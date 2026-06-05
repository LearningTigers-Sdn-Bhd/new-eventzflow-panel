"use client";

import { DollarSign, Package } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEventSponsorshipItem } from "@/hooks/use-event-sponsorships";

interface CreateEventSponsorshipItemFormProps {
	sponsorshipId: string;
	currency: string;
	onClose: () => void;
}

export default function CreateEventSponsorshipItemForm({
	sponsorshipId,
	currency,
	onClose,
}: CreateEventSponsorshipItemFormProps) {
	const titleId = useId();
	const quantityId = useId();
	const unitValueId = useId();
	const totalValueId = useId();
	const notesId = useId();
	const receivedId = useId();

	const [formData, setFormData] = useState({
		title: "",
		quantity: "1",
		unit_value: "",
		total_value: "",
		notes: "",
		received: false,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const createMutation = useCreateEventSponsorshipItem();

	const calculateTotal = (qty: string, unit: string) => {
		const q = Number.parseFloat(qty) || 0;
		const u = Number.parseFloat(unit) || 0;
		return (q * u).toFixed(2);
	};

	const handleChange = (field: string, value: any) => {
		setFormData((prev) => {
			const next = { ...prev, [field]: value };

			// Auto-calc total if qty or unit changes
			if (field === "quantity" || field === "unit_value") {
				next.total_value = calculateTotal(next.quantity, next.unit_value);
			}

			return next;
		});

		if (errors[field]) {
			const newErrors = { ...errors };
			delete newErrors[field];
			setErrors(newErrors);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const newErrors: Record<string, string> = {};

		if (!formData.title) {
			newErrors.title = "Item title is required";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			await createMutation.mutateAsync({
				sponsorshipId,
				data: {
					item_type: "in_kind",
					title: formData.title,
					quantity: Number.parseInt(formData.quantity) || 1,
					unit_value: formData.unit_value || "0",
					total_value: formData.total_value || "0",
					notes: formData.notes,
					received: formData.received,
				},
			});

			toast.success("Item added successfully!");
			onClose();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to add item";
			toast.error(message);
		}
	};

	return (
		<div className="w-full">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldSeparator />
					<FieldGroup>
						<div className="space-y-6">
							<div className="flex items-center gap-2 border-b pb-2">
								<Package className="size-5 text-primary" />
								<h3 className="font-semibold text-lg">Item Details</h3>
							</div>

							<Field orientation="vertical">
								<FieldLabel htmlFor={titleId}>Item Title *</FieldLabel>
								{errors.title && <FieldError>{errors.title}</FieldError>}
								<Input
									id={titleId}
									placeholder="e.g. 500x Water Bottles"
									value={formData.title}
									onChange={(e) => handleChange("title", e.target.value)}
									required
									disabled={createMutation.isPending}
								/>
							</Field>

							<div className="grid grid-cols-3 gap-4">
								<Field orientation="vertical">
									<FieldLabel htmlFor={quantityId}>Quantity</FieldLabel>
									<Input
										id={quantityId}
										type="number"
										min={1}
										value={formData.quantity}
										onChange={(e) => handleChange("quantity", e.target.value)}
										disabled={createMutation.isPending}
									/>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={unitValueId}>
										Unit Value ({currency})
									</FieldLabel>
									<div className="relative">
										<DollarSign className="absolute top-3 left-3 size-4 text-muted-foreground" />
										<Input
											id={unitValueId}
											type="number"
											className="pl-9"
											placeholder="0.00"
											value={formData.unit_value}
											onChange={(e) =>
												handleChange("unit_value", e.target.value)
											}
											disabled={createMutation.isPending}
										/>
									</div>
								</Field>

								<Field orientation="vertical">
									<FieldLabel htmlFor={totalValueId}>Total Value</FieldLabel>
									<div className="relative">
										<DollarSign className="absolute top-3 left-3 size-4 text-muted-foreground" />
										<Input
											id={totalValueId}
											type="number"
											className="pl-9"
											placeholder="0.00"
											value={formData.total_value}
											onChange={(e) =>
												handleChange("total_value", e.target.value)
											}
											disabled={createMutation.isPending} // Read-only mostly, but editable if needed
										/>
									</div>
								</Field>
							</div>

							<Field
								orientation="horizontal"
								className="items-center justify-between rounded-lg border p-3"
							>
								<div className="space-y-0.5">
									<FieldLabel htmlFor={receivedId} className="text-base">
										Mark as Received
									</FieldLabel>
									<p className="text-muted-foreground text-xs">
										If checked, the value will be added to the total received
										amount.
									</p>
								</div>
								<Switch
									id={receivedId}
									checked={formData.received}
									onCheckedChange={(checked) =>
										handleChange("received", checked)
									}
									disabled={createMutation.isPending}
								/>
							</Field>

							<Field orientation="vertical">
								<FieldLabel htmlFor={notesId}>Notes</FieldLabel>
								<Textarea
									id={notesId}
									placeholder="Additional details..."
									value={formData.notes}
									onChange={(e) => handleChange("notes", e.target.value)}
									disabled={createMutation.isPending}
									rows={2}
								/>
							</Field>
						</div>

						<FieldSeparator />

						<div className="flex justify-end gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={createMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={createMutation.isPending}>
								{createMutation.isPending ? "Adding..." : "Add Item"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
