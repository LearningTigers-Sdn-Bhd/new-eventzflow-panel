"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { InlineFilePreview } from "@/components/file-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EventVendor } from "@/lib/api/event-vendor";
import {
	rejectExhibitorKitPaymentProof,
	updateExhibitorKit,
} from "@/lib/api/exhibitor-kit";

export interface ManagePaymentFormProps {
	vendor: EventVendor;
	kitId: number;
	onClose?: () => void;
}

export function ManagePaymentForm({
	vendor,
	kitId,
	onClose,
}: ManagePaymentFormProps) {
	const params = useParams();
	const eventId = Number(params.event_id);
	const kit = vendor.exhibitor_kits.find((candidate) => candidate.id === kitId);

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
	const [isRejecting, setIsRejecting] = useState(false);

	const queryClient = useQueryClient();

	const updatePaymentMutation = useMutation({
		mutationFn: (data: Parameters<typeof updateExhibitorKit>[2]) => {
			if (!kit) throw new Error("No exhibitor kit found");
			return updateExhibitorKit(eventId, kit.id, data);
		},
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
				| "sponsored"
				| "deposit",
			amount_paid: amountPaid || undefined,
			payment_note: paymentNote || undefined,
		});
	};

	const handleRejectProof = async () => {
		if (!kit) return;
		if (!paymentNote.trim()) {
			toast.error("Add a rejection reason first");
			return;
		}
		setIsRejecting(true);
		try {
			await rejectExhibitorKitPaymentProof(eventId, kit.id, paymentNote.trim());
			toast.success("Payment proof rejected");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			onClose?.();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to reject payment proof",
			);
		} finally {
			setIsRejecting(false);
		}
	};

	if (!kit) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				No exhibitor kit found.
			</div>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="grid gap-6 pt-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"
		>
			<section className="min-h-96 border bg-muted/30">
				<div className="flex items-center justify-between border-b bg-background px-4 py-3">
					<div>
						<p className="font-medium text-sm">Payment Proof</p>
						<p className="text-muted-foreground text-xs">
							Review submitted evidence before updating status.
						</p>
					</div>
					{kit.payment_proof_status === "rejected" ? (
						<Badge
							variant="outline"
							className="rounded-none border-destructive text-destructive"
						>
							Rejected
						</Badge>
					) : kit.payment_proof_url ? (
						<a
							href={kit.payment_proof_url}
							target="_blank"
							rel="noreferrer"
							className="text-primary text-xs underline"
						>
							Open original
						</a>
					) : null}
				</div>
				<div className="flex min-h-96 items-center justify-center p-4">
					{kit.payment_proof_url ? (
						<InlineFilePreview
							source={{ url: kit.payment_proof_url }}
							title="Submitted payment proof"
							className="max-h-[55vh] w-full"
						/>
					) : (
						<p className="text-muted-foreground text-sm">
							No payment proof submitted.
						</p>
					)}
				</div>
			</section>
			<section className="flex flex-col gap-4">
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
								<SelectItem value="deposit">Deposit</SelectItem>
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
							Review Note{" "}
							{kit.payment_proof_url && (
								<span className="font-normal text-muted-foreground">
									(optional)
								</span>
							)}
						</FieldLabel>
						<Textarea
							id={paymentNoteField}
							value={paymentNote}
							onChange={(e) => setPaymentNote(e.target.value)}
							placeholder="Payment notes..."
							disabled={updatePaymentMutation.isPending}
							className="min-h-[100px] rounded-none"
						/>
						{kit.payment_proof_url && (
							<p className="text-muted-foreground text-xs">
								Add context for this payment review. A reason is required only
								if you reject the proof.
							</p>
						)}
					</Field>
				</FieldGroup>

				<div className="mt-auto flex flex-wrap justify-end gap-2">
					{kit.payment_proof_url && kit.payment_status !== "paid" && (
						<Button
							type="button"
							variant="destructive"
							onClick={handleRejectProof}
							disabled={
								updatePaymentMutation.isPending ||
								isRejecting ||
								kit.payment_proof_status === "rejected"
							}
							className="rounded-none"
						>
							{kit.payment_proof_status === "rejected"
								? "Proof Rejected"
								: isRejecting
									? "Rejecting..."
									: "Reject Proof"}
						</Button>
					)}
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
			</section>
		</form>
	);
}
