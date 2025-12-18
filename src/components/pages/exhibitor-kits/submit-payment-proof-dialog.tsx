"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, Pencil } from "lucide-react";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { updateExhibitorKitPayment, type ExhibitorKitPayment } from "@/lib/api/exhibitor-kit-payment";

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

	const [paymentSource, setPaymentSource] = useState<"manual_bank_in" | "payment_gateway">("manual_bank_in");
	const [paymentProofUrl, setPaymentProofUrl] = useState("");
	const [externalRef, setExternalRef] = useState("");

	// Determine if this is an edit (has existing data) or new submission
	const isEdit = payment?.status === "submitted";
	const isResubmit = payment?.status === "rejected";

	// Pre-fill form with existing payment data when dialog opens
	useEffect(() => {
		if (open && payment) {
			setPaymentSource(payment.paymentSource || "manual_bank_in");
			setPaymentProofUrl(payment.paymentProofUrl || "");
			setExternalRef(payment.externalRef || "");
		}
	}, [open, payment]);

	const updateMutation = useMutation({
		mutationFn: () => {
			if (!payment) throw new Error("No payment selected");

			return updateExhibitorKitPayment({
				eventId,
				exhibitorKitId: kitId,
				paymentId: payment.id.toString(),
				payment_source: paymentSource,
				payment_proof_url: paymentProofUrl,
				external_ref: externalRef || undefined,
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

		if (!paymentProofUrl.trim()) {
			toast.error("Please provide a payment proof URL");
			return;
		}

		// Basic URL validation
		try {
			new URL(paymentProofUrl);
		} catch {
			toast.error("Please enter a valid URL for the payment proof");
			return;
		}

		updateMutation.mutate();
	};

	// Get dialog title and description based on mode
	const getDialogContent = () => {
		if (isEdit) {
			return {
				icon: Pencil,
				title: "Edit Payment Proof",
				description: "Update your payment proof details. The contractor will review your updated submission.",
			};
		}
		if (isResubmit) {
			return {
				icon: Upload,
				title: "Resubmit Payment Proof",
				description: "Your previous submission was rejected. Please update and resubmit your payment proof.",
			};
		}
		return {
			icon: Upload,
			title: "Submit Payment Proof",
			description: "Upload your payment proof to complete this payment. Once submitted, the contractor will verify your payment.",
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
					<DialogDescription>
						{dialogContent.description}
					</DialogDescription>
				</DialogHeader>

				{payment && (
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Payment Amount */}
						<div className="rounded-none border bg-muted/30 p-4 text-center">
							<p className="text-muted-foreground text-sm">Amount to Pay</p>
							<p className="font-bold text-2xl">RM {payment.amount.toFixed(2)}</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="paymentSource">Payment Method</Label>
							<Select
								value={paymentSource}
								onValueChange={(value: "manual_bank_in" | "payment_gateway") =>
									setPaymentSource(value)
								}
							>
								<SelectTrigger className="rounded-none">
									<SelectValue placeholder="Select payment method" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="manual_bank_in">Bank Transfer</SelectItem>
									<SelectItem value="payment_gateway">Payment Gateway</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="paymentProofUrl">Payment Proof URL *</Label>
							<Input
								id="paymentProofUrl"
								type="url"
								placeholder="https://drive.google.com/..."
								value={paymentProofUrl}
								onChange={(e) => setPaymentProofUrl(e.target.value)}
								className="rounded-none"
								required
							/>
							<p className="text-muted-foreground text-xs">
								Upload your payment receipt to Google Drive, Dropbox, or any file hosting service and paste the link here.
							</p>
						</div>

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
								disabled={updateMutation.isPending}
								className="rounded-none"
							>
								{updateMutation.isPending
									? "Submitting..."
									: isEdit
										? "Update Proof"
										: "Submit Proof"
								}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
