"use client";

import { Calendar, CreditCard, DollarSign, Hash } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateEventSponsorshipPayment } from "@/hooks/use-event-sponsorships";
import type { EventSponsorship } from "@/lib/api/sponsorship/response";

interface AddPaymentFormProps {
	sponsorship: EventSponsorship;
	onClose: () => void;
}

export default function AddPaymentForm({
	sponsorship,
	onClose,
}: AddPaymentFormProps) {
	const amountId = useId();
	const dateId = useId();
	const methodId = useId();
	const refId = useId();
	const notesId = useId();

	const [formData, setFormData] = useState({
		amount: "",
		received_at: new Date().toISOString().split("T")[0], // Today YYYY-MM-DD
		method: "bank_transfer",
		reference_no: "",
		notes: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const createMutation = useCreateEventSponsorshipPayment();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const newErrors: Record<string, string> = {};

		if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
			newErrors.amount = "Please enter a valid amount";
		}
		if (!formData.received_at) {
			newErrors.received_at = "Date is required";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			await createMutation.mutateAsync({
				sponsorshipId: sponsorship.id.toString(),
				data: {
					amount: formData.amount,
					received_at: new Date(formData.received_at).toISOString(),
					currency: sponsorship.currency,
					method: formData.method as any,
					reference_no: formData.reference_no,
					notes: formData.notes,
				},
			});

			toast.success("Payment recorded successfully!");
			onClose();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to add payment";
			toast.error(message);
		}
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			const newErrors = { ...errors };
			delete newErrors[field];
			setErrors(newErrors);
		}
	};

	return (
		<div className="mx-auto w-full max-w-lg px-8">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldSeparator />
					<FieldGroup>
						<div className="space-y-4">
							<Field orientation="vertical">
								<FieldLabel htmlFor={amountId}>
									Amount ({sponsorship.currency}) *
								</FieldLabel>
								{errors.amount && <FieldError>{errors.amount}</FieldError>}
								<div className="relative">
									<DollarSign className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
									<Input
										id={amountId}
										type="number"
										className="pl-9"
										placeholder="0.00"
										value={formData.amount}
										onChange={(e) => handleChange("amount", e.target.value)}
										required
										disabled={createMutation.isPending}
									/>
								</div>
							</Field>

							<Field orientation="vertical">
								<FieldLabel htmlFor={dateId}>Received Date *</FieldLabel>
								<div className="relative">
									<Calendar className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
									<Input
										id={dateId}
										type="date"
										className="pl-9"
										value={formData.received_at}
										onChange={(e) =>
											handleChange("received_at", e.target.value)
										}
										required
										disabled={createMutation.isPending}
									/>
								</div>
							</Field>

							<Field orientation="vertical">
								<FieldLabel htmlFor={methodId}>Payment Method</FieldLabel>
								<Select
									value={formData.method}
									onValueChange={(val) => handleChange("method", val)}
									disabled={createMutation.isPending}
								>
									<SelectTrigger id={methodId}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
										<SelectItem value="cash">Cash</SelectItem>
										<SelectItem value="card">Card</SelectItem>
										<SelectItem value="cheque">Cheque</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
							</Field>

							<Field orientation="vertical">
								<FieldLabel htmlFor={refId}>Reference No.</FieldLabel>
								<div className="relative">
									<Hash className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
									<Input
										id={refId}
										className="pl-9"
										placeholder="e.g. TXN123456"
										value={formData.reference_no}
										onChange={(e) =>
											handleChange("reference_no", e.target.value)
										}
										disabled={createMutation.isPending}
									/>
								</div>
							</Field>

							<Field orientation="vertical">
								<FieldLabel htmlFor={notesId}>Notes</FieldLabel>
								<Textarea
									id={notesId}
									placeholder="Optional notes..."
									value={formData.notes}
									onChange={(e) => handleChange("notes", e.target.value)}
									disabled={createMutation.isPending}
									rows={2}
								/>
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
								{createMutation.isPending ? "Adding..." : "Add Payment"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
