"use client";

import { Calendar, DollarSign, Hash, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import DeleteConfirmationDialog from "@/components/dialogs/delete-confirmation-dialog";
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
import { useDialog } from "@/hooks/use-dialog";
import {
	useDeleteEventSponsorshipPayment,
	useUpdateEventSponsorshipPayment,
} from "@/hooks/use-event-sponsorships";
import type {
	EventSponsorship,
	EventSponsorshipPayment,
} from "@/lib/api/sponsorship/response";

interface EditEventSponsorshipPaymentFormProps {
	sponsorship: EventSponsorship;
	payment: EventSponsorshipPayment;
	onClose: () => void;
}

export default function EditEventSponsorshipPaymentForm({
	sponsorship,
	payment,
	onClose,
}: EditEventSponsorshipPaymentFormProps) {
	const { openDialog, closeDialog: closeDeleteDialog } = useDialog();
	const amountId = useId();
	const dateId = useId();
	const methodId = useId();
	const refId = useId();
	const notesId = useId();

	const [formData, setFormData] = useState({
		amount: payment.amount,
		received_at: payment.received_at
			? new Date(payment.received_at).toISOString().split("T")[0]
			: "",
		method: payment.method,
		reference_no: payment.reference_no || "",
		notes: payment.notes || "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const updateMutation = useUpdateEventSponsorshipPayment();
	const deleteMutation = useDeleteEventSponsorshipPayment();

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
			await updateMutation.mutateAsync({
				sponsorshipId: sponsorship.id.toString(),
				id: payment.id.toString(),
				data: {
					amount: formData.amount,
					received_at: new Date(formData.received_at).toISOString(),
					currency: sponsorship.currency,
					method: formData.method as any,
					reference_no: formData.reference_no,
					notes: formData.notes,
				},
			});

			toast.success("Payment updated successfully!");
			onClose();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to update payment";
			toast.error(message);
		}
	};

	const handleDelete = () => {
		openDialog({
			component: DeleteConfirmationDialog,
			props: {
				title: "Delete Payment",
				description: `Are you sure you want to permanently delete this payment of ${sponsorship.currency} ${Number.parseFloat(payment.amount).toLocaleString()}?`,
				// We pass a function that returns a promise so the dialog can manage loading state
				onConfirm: async () => {
					try {
						await deleteMutation.mutateAsync({
							sponsorshipId: sponsorship.id.toString(),
							id: payment.id.toString(),
						});
						toast.success("Payment deleted successfully");
						closeDeleteDialog();
						onClose(); // Close the parent edit modal
					} catch (error: any) {
						toast.error(error.message || "Failed to delete payment");
					}
				},
				onClose: closeDeleteDialog,
			},
			config: { showCloseButton: false },
		});
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
						<div className="flex items-center justify-between border-b">
							<div className="flex items-center gap-2">
								<DollarSign className="size-5 text-primary" />
								<h3 className="font-semibold text-lg">Edit Payment</h3>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={handleDelete}
								className="text-destructive hover:text-destructive/90"
							>
								<Trash2 className="size-4" />
							</Button>
						</div>

						<div className="space-y-3">
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
										disabled={updateMutation.isPending}
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
										disabled={updateMutation.isPending}
									/>
								</div>
							</Field>

							<Field orientation="vertical">
								<FieldLabel htmlFor={methodId}>Payment Method</FieldLabel>
								<Select
									value={formData.method}
									onValueChange={(val) => handleChange("method", val)}
									disabled={updateMutation.isPending}
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
										disabled={updateMutation.isPending}
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
									disabled={updateMutation.isPending}
									rows={2}
								/>
							</Field>

							{/* Audit Info */}
							<div className="space-y-1 border-t pt-2 text-muted-foreground text-xs">
								{payment.created_by && (
									<div>
										Created by {payment.created_by.full_name} on{" "}
										{new Date(payment.created_at).toLocaleDateString()}
									</div>
								)}
								{payment.updated_by &&
									payment.updated_at !== payment.created_at && (
										<div>
											Last updated by {payment.updated_by.full_name} on{" "}
											{new Date(payment.updated_at).toLocaleString()}
										</div>
									)}
							</div>
						</div>

						<FieldSeparator />

						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={updateMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateMutation.isPending}>
								{updateMutation.isPending ? "Updating..." : "Update Payment"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</div>
	);
}
