"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, CreditCard, Pencil, Upload, User } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	type ExhibitorKitPayment,
	submitPaymentProof,
} from "@/lib/api/exhibitor-kit-payment";
import PaymentReceiptUpload from "./payment-receipt-upload";

interface SubmitPaymentProofDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	payment: ExhibitorKitPayment | null;
	eventId: string;
	kitId: string;
}

export function SubmitPaymentProofDialog({
	open,
	onOpenChange,
	payment,
	eventId,
	kitId,
}: SubmitPaymentProofDialogProps) {
	const queryClient = useQueryClient();

	const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
	const [externalRef, setExternalRef] = useState("");

	// Determine if this is an edit (has existing data) or new submission
	const isEdit = payment?.status === "submitted";
	const isResubmit = payment?.status === "rejected";

	// Pre-fill form with existing payment data when dialog opens
	useEffect(() => {
		if (open && payment) {
			setExternalRef(payment.externalRef || "");
			setPaymentProofFile(null); // Reset file on open
		}
	}, [open, payment]);

	const submitMutation = useMutation({
		mutationFn: () => {
			if (!payment) throw new Error("No payment selected");
			if (!paymentProofFile) throw new Error("Please upload a payment proof");

			return submitPaymentProof({
				eventId,
				exhibitorKitId: kitId,
				paymentId: payment.id.toString(),
				paymentProof: paymentProofFile,
				externalRef: externalRef || undefined,
			});
		},
		onSuccess: () => {
			const message = isEdit
				? "Payment proof updated successfully"
				: "Payment proof submitted successfully";
			toast.success(message);
			queryClient.invalidateQueries({
				queryKey: ["exhibitor-kit-payments", eventId, kitId],
			});
			onOpenChange(false);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to submit payment proof");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!paymentProofFile) {
			toast.error("Please upload a payment proof");
			return;
		}

		submitMutation.mutate();
	};

	// Get dialog title and description based on mode
	const getDialogContent = () => {
		if (isEdit) {
			return {
				icon: Pencil,
				title: "Edit Payment Proof",
				description:
					"Update your payment proof. The contractor will review your updated submission.",
			};
		}
		if (isResubmit) {
			return {
				icon: Upload,
				title: "Resubmit Payment Proof",
				description:
					"Your previous submission was rejected. Please upload a new payment proof.",
			};
		}
		return {
			icon: Upload,
			title: "Submit Payment Proof",
			description:
				"Upload your payment proof to complete this payment. Once submitted, the contractor will verify your payment.",
		};
	};

	const dialogContent = getDialogContent();
	const DialogIcon = dialogContent.icon;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<DialogIcon className="size-5" />
						{dialogContent.title}
					</DialogTitle>
					<DialogDescription>{dialogContent.description}</DialogDescription>
				</DialogHeader>

				{payment && (
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Payment Amount */}
						<div className="rounded-none border bg-muted/30 p-4 text-center">
							<p className="text-muted-foreground text-sm">Amount to Pay</p>
							<p className="font-bold text-2xl">
								RM {payment.amount.toFixed(2)}
							</p>
						</div>

						{/* Payee Bank Details */}
						{payment.payeePaymentDetail ? (
							<div className="space-y-2 rounded-none border bg-muted/30 p-4">
								<p className="font-medium text-muted-foreground text-sm">
									Transfer to:
								</p>
								<div className="space-y-1.5">
									<div className="flex items-center gap-2 text-sm">
										<Building2 className="size-4 text-muted-foreground" />
										<span>{payment.payeePaymentDetail.bankName}</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<CreditCard className="size-4 text-muted-foreground" />
										<span className="font-mono">
											{payment.payeePaymentDetail.accountNumber}
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<User className="size-4 text-muted-foreground" />
										<span>{payment.payeePaymentDetail.accountName}</span>
									</div>
								</div>
							</div>
						) : (
							<div className="rounded-none border border-amber-200 bg-amber-50 p-4 text-amber-700 text-sm dark:bg-amber-950/20 dark:text-amber-400">
								<p>
									Payment details are not yet available. Please contact{" "}
									{payment.payeeName} for bank transfer information.
								</p>
							</div>
						)}

						{/* Payment Proof Upload */}
						<div className="space-y-2">
							<Label>Payment Proof *</Label>
							<PaymentReceiptUpload
								value={paymentProofFile || payment.paymentProofUrl || undefined}
								onChange={setPaymentProofFile}
								disabled={submitMutation.isPending}
							/>
						</div>

						{/* Reference Number */}
						<div className="space-y-2">
							<Label htmlFor="externalRef">Reference Number (Optional)</Label>
							<Input
								id="externalRef"
								type="text"
								placeholder="e.g., Transaction ID, Bank Reference"
								value={externalRef}
								onChange={(e) => setExternalRef(e.target.value)}
								className="rounded-none"
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
								disabled={submitMutation.isPending || !paymentProofFile}
								className="rounded-none"
							>
								{submitMutation.isPending
									? "Submitting..."
									: isEdit
										? "Update Proof"
										: "Submit Proof"}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
