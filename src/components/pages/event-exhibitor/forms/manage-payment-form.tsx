"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldGroup,
	FieldLabel,
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
import { updateExhibitorKit } from "@/lib/api/exhibitor-kit";
import type { EventVendor } from "@/lib/api/event-vendor";

export interface ManagePaymentFormProps {
	vendor: EventVendor;
	onClose?: () => void;
}

export function ManagePaymentForm({ vendor, onClose }: ManagePaymentFormProps) {
	const params = useParams();
	const eventId = Number(params.event_id);
	const kit = vendor.exhibitor_kit;

	// Form field IDs
	const paymentStatusField = useId();
	const amountPaidField = useId();
	const paymentNoteField = useId();

	// Form state
	const [paymentStatus, setPaymentStatus] = useState<string>(
		kit?.payment_status || "unpaid",
	);
	const [amountPaid, setAmountPaid] = useState(kit?.amount_paid || "");
	const [paymentNote, setPaymentNote] = useState(kit?.payment_note || "");

	const queryClient = useQueryClient();

	const updatePaymentMutation = useMutation({
		mutationFn: (data: Parameters<typeof updateExhibitorKit>[2]) =>
			updateExhibitorKit(eventId, kit!.id, data),
		onSuccess: () => {
			toast.success("Payment updated successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update payment");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!kit) {
			toast.error("No exhibitor kit found");
			return;
		}

		await updatePaymentMutation.mutateAsync({
			payment_status: paymentStatus as
				| "unpaid"
				| "paid"
				| "waived"
				| "sponsored",
			amount_paid: amountPaid || undefined,
			payment_note: paymentNote || undefined,
		});
	};

	if (!kit) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				No exhibitor kit found.
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
			<FieldGroup className="gap-4">
				<Field orientation="vertical">
					<FieldLabel htmlFor={paymentStatusField} className="text-sm">
						Payment Status
					</FieldLabel>
					<Select
						value={paymentStatus}
						onValueChange={setPaymentStatus}
						disabled={updatePaymentMutation.isPending}
					>
						<SelectTrigger id={paymentStatusField} className="rounded-none">
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent className="rounded-none">
							<SelectItem value="unpaid">Unpaid</SelectItem>
							<SelectItem value="paid">Paid</SelectItem>
							<SelectItem value="waived">Waived</SelectItem>
							<SelectItem value="sponsored">Sponsored</SelectItem>
						</SelectContent>
					</Select>
				</Field>

				<Field orientation="vertical">
					<FieldLabel htmlFor={amountPaidField} className="text-sm">
						Amount Paid
					</FieldLabel>
					<Input
						id={amountPaidField}
						type="number"
						value={amountPaid}
						onChange={(e) => setAmountPaid(e.target.value)}
						placeholder="0.00"
						disabled={updatePaymentMutation.isPending}
						className="rounded-none"
					/>
				</Field>

				<Field orientation="vertical">
					<FieldLabel htmlFor={paymentNoteField} className="text-sm">
						Note
					</FieldLabel>
					<Textarea
						id={paymentNoteField}
						value={paymentNote}
						onChange={(e) => setPaymentNote(e.target.value)}
						placeholder="Payment notes..."
						disabled={updatePaymentMutation.isPending}
						className="min-h-[100px] rounded-none"
					/>
				</Field>
			</FieldGroup>

			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={onClose}
					disabled={updatePaymentMutation.isPending}
					className="rounded-none"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={updatePaymentMutation.isPending}
					className="rounded-none"
				>
					{updatePaymentMutation.isPending ? "Saving..." : "Save"}
				</Button>
			</div>
		</form>
	);
}
