"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	type ExhibitorKitPayment,
	updateExhibitorKitPayment,
} from "@/lib/api/exhibitor-kit-payment";

interface VerifyRejectPaymentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	payment: ExhibitorKitPayment | null;
	eventId: string;
	kitId: string;
	action: "verify" | "reject";
}

export function VerifyRejectPaymentDialog({
	open,
	onOpenChange,
	payment,
	eventId,
	kitId,
	action,
}: VerifyRejectPaymentDialogProps) {
	const queryClient = useQueryClient();
	const [note, setNote] = useState("");

	const updateMutation = useMutation({
		mutationFn: () => {
			if (!payment) throw new Error("No payment selected");

			return updateExhibitorKitPayment({
				eventId,
				exhibitorKitId: kitId,
				paymentId: payment.id.toString(),
				status: action === "verify" ? "verified" : "rejected",
				note: note || undefined,
				paid_at: action === "verify" ? new Date().toISOString() : undefined,
			});
		},
		onSuccess: () => {
			toast.success(
				action === "verify"
					? "Payment verified successfully"
					: "Payment rejected",
			);
			queryClient.invalidateQueries({
				queryKey: ["exhibitor-kit-payments", eventId, kitId],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "vendors"],
			});
			onOpenChange(false);
			setNote("");
		},
		onError: (error: Error) => {
			toast.error(error.message || `Failed to ${action} payment`);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateMutation.mutate();
	};

	const isVerify = action === "verify";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{isVerify ? (
							<CheckCircle2 className="size-5 text-green-600" />
						) : (
							<XCircle className="size-5 text-red-600" />
						)}
						{isVerify ? "Verify Payment" : "Reject Payment"}
					</DialogTitle>
					<DialogDescription>
						{isVerify
							? "Confirm that you have received this payment."
							: "Reject this payment submission. The exhibitor will be able to resubmit with a new proof."}
					</DialogDescription>
				</DialogHeader>

				{payment && (
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Payment Summary */}
						<div className="space-y-2 rounded-none border bg-muted/30 p-4">
							<div className="flex justify-between">
								<span className="text-muted-foreground text-sm">Amount:</span>
								<span className="font-bold">
									RM {payment.amount.toFixed(2)}
								</span>
							</div>
							{payment.paymentSource && (
								<div className="flex justify-between">
									<span className="text-muted-foreground text-sm">Method:</span>
									<span className="text-sm">
										{payment.paymentSource === "manual_bank_in"
											? "Bank Transfer"
											: "Payment Gateway"}
									</span>
								</div>
							)}
							{payment.paymentProofUrl && (
								<div className="border-t pt-2">
									<a
										href={payment.paymentProofUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary text-sm underline"
									>
										View Payment Proof
									</a>
								</div>
							)}
							{payment.externalRef && (
								<div className="flex justify-between">
									<span className="text-muted-foreground text-sm">
										Reference:
									</span>
									<span className="text-sm">{payment.externalRef}</span>
								</div>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="note">
								{isVerify ? "Note (Optional)" : "Rejection Reason (Optional)"}
							</Label>
							<Textarea
								id="note"
								placeholder={
									isVerify
										? "Add any notes..."
										: "Explain why this payment is being rejected..."
								}
								value={note}
								onChange={(e) => setNote(e.target.value)}
								className="min-h-[80px] rounded-none"
							/>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								className="rounded-none"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={updateMutation.isPending}
								className={`rounded-none ${
									isVerify
										? "bg-green-600 hover:bg-green-700"
										: "bg-red-600 hover:bg-red-700"
								}`}
							>
								{updateMutation.isPending
									? isVerify
										? "Verifying..."
										: "Rejecting..."
									: isVerify
										? "Verify Payment"
										: "Reject Payment"}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
