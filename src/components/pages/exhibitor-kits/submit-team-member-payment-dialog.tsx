"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CreditCard, Upload, User, Users } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrganizerPaymentDetail } from "@/lib/api/event";
import {
	createExhibitorTeamMemberPayment,
	type ExhibitorTeamMemberPayment,
	resubmitTeamMemberPaymentProof,
} from "@/lib/api/exhibitor-team-member-payment";
import PaymentReceiptUpload from "./payment-receipt-upload";

interface SubmitTeamMemberPaymentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventId: string;
	kitId: string;
	// For new payment
	extraMemberCount?: number;
	feePerMember?: number;
	totalAmount?: number;
	// For resubmitting rejected payment
	existingPayment?: ExhibitorTeamMemberPayment | null;
}

export function SubmitTeamMemberPaymentDialog({
	open,
	onOpenChange,
	eventId,
	kitId,
	extraMemberCount = 0,
	feePerMember = 0,
	totalAmount = 0,
	existingPayment,
}: SubmitTeamMemberPaymentDialogProps) {
	const queryClient = useQueryClient();

	const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
	const [externalRef, setExternalRef] = useState("");

	const isResubmit = existingPayment?.status === "rejected";

	// Fetch organizer payment details for bank transfer info
	const { data: organizerPaymentDetail } = useQuery({
		queryKey: ["organizer-payment-detail", eventId],
		queryFn: () => getOrganizerPaymentDetail(eventId),
		enabled: open,
	});

	// Create new payment mutation
	const createMutation = useMutation({
		mutationFn: () => {
			if (!paymentProofFile) throw new Error("Please upload a payment proof");

			return createExhibitorTeamMemberPayment({
				eventId,
				exhibitorKitId: kitId,
				paymentProof: paymentProofFile,
				externalRef: externalRef || undefined,
			});
		},
		onSuccess: () => {
			toast.success("Payment submitted successfully");
			queryClient.invalidateQueries({
				queryKey: ["exhibitor-team-member-payments", eventId, kitId],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "vendors"],
			});
			handleClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to submit payment");
		},
	});

	// Resubmit payment mutation
	const resubmitMutation = useMutation({
		mutationFn: () => {
			if (!existingPayment) throw new Error("No payment to resubmit");
			if (!paymentProofFile) throw new Error("Please upload a payment proof");

			return resubmitTeamMemberPaymentProof({
				eventId,
				exhibitorKitId: kitId,
				paymentId: existingPayment.id.toString(),
				paymentProof: paymentProofFile,
				externalRef: externalRef || undefined,
			});
		},
		onSuccess: () => {
			toast.success("Payment proof resubmitted successfully");
			queryClient.invalidateQueries({
				queryKey: ["exhibitor-team-member-payments", eventId, kitId],
			});
			handleClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to resubmit payment proof");
		},
	});

	const handleClose = () => {
		setPaymentProofFile(null);
		setExternalRef("");
		onOpenChange(false);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!paymentProofFile) {
			toast.error("Please upload a payment proof");
			return;
		}

		if (isResubmit) {
			resubmitMutation.mutate();
		} else {
			createMutation.mutate();
		}
	};

	const isPending = createMutation.isPending || resubmitMutation.isPending;
	const displayAmount = existingPayment?.amount ?? totalAmount;
	const displayCount = existingPayment?.extraMemberCount ?? extraMemberCount;
	const displayFee = existingPayment?.feePerMember ?? feePerMember;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Users className="size-5" />
						{isResubmit
							? "Resubmit Payment Proof"
							: "Pay for Extra Team Members"}
					</DialogTitle>
					<DialogDescription>
						{isResubmit
							? "Your previous submission was rejected. Please upload a new payment proof."
							: "Upload your payment proof to pay for extra team members. The organizer will verify your payment."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Payment Summary */}
					<div className="rounded-none border bg-muted/30 p-4">
						<div className="mb-2 text-center">
							<p className="text-muted-foreground text-sm">Amount to Pay</p>
							<p className="font-bold text-2xl">
								RM {displayAmount.toFixed(2)}
							</p>
						</div>
						<div className="border-t pt-2 text-center text-muted-foreground text-xs">
							{displayCount} extra member{displayCount !== 1 ? "s" : ""} × RM{" "}
							{displayFee.toFixed(2)}
						</div>
					</div>

					{/* Organizer Bank Details */}
					{organizerPaymentDetail ? (
						<div className="space-y-2 rounded-none border bg-muted/30 p-4">
							<p className="font-medium text-muted-foreground text-sm">
								Transfer to:
							</p>
							<div className="space-y-1.5">
								<div className="flex items-center gap-2 text-sm">
									<Building2 className="size-4 text-muted-foreground" />
									<span>{organizerPaymentDetail.bank_name}</span>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<CreditCard className="size-4 text-muted-foreground" />
									<span className="font-mono">
										{organizerPaymentDetail.account_number}
									</span>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<User className="size-4 text-muted-foreground" />
									<span>{organizerPaymentDetail.account_name}</span>
								</div>
							</div>
						</div>
					) : (
						<div className="rounded-none border border-amber-200 bg-amber-50 p-4 text-amber-700 text-sm dark:bg-amber-950/20 dark:text-amber-400">
							<p>
								Payment details are not yet available. Please contact the
								organizer for bank transfer information.
							</p>
						</div>
					)}

					{/* Payment Proof Upload */}
					<div className="space-y-2">
						<Label>Payment Proof *</Label>
						<PaymentReceiptUpload
							value={paymentProofFile || undefined}
							onChange={setPaymentProofFile}
							disabled={isPending}
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
							onClick={handleClose}
							className="rounded-none"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isPending || !paymentProofFile}
							className="rounded-none"
						>
							{isPending ? (
								"Submitting..."
							) : (
								<>
									<Upload className="mr-2 size-4" />
									{isResubmit ? "Resubmit" : "Submit Payment"}
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
