"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Clock,
	CheckCircle2,
	XCircle,
	AlertCircle,
	Upload,
	ExternalLink,
	Users,
	CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getExhibitorTeamMemberPayments,
	type ExhibitorTeamMemberPayment,
} from "@/lib/api/exhibitor-team-member-payment";
import { cn } from "@/lib/utils";
import { SubmitTeamMemberPaymentDialog } from "./submit-team-member-payment-dialog";

interface TeamMemberPaymentSectionProps {
	eventId: string;
	kitId: string;
	// Current excess member info (for creating new payment)
	excessCount: number;
	feePerMember: number;
	totalCharges: number;
}

const getStatusConfig = (status: ExhibitorTeamMemberPayment["status"]) => {
	switch (status) {
		case "pending":
			return {
				icon: Clock,
				label: "Awaiting Payment",
				badgeStyle: "border-amber-500 text-amber-600",
			};
		case "submitted":
			return {
				icon: AlertCircle,
				label: "Under Review",
				badgeStyle: "border-blue-500 text-blue-600",
			};
		case "verified":
			return {
				icon: CheckCircle2,
				label: "Verified",
				badgeStyle: "border-green-500 text-green-600",
			};
		case "rejected":
			return {
				icon: XCircle,
				label: "Rejected",
				badgeStyle: "border-red-500 text-red-600",
			};
	}
};

export function TeamMemberPaymentSection({
	eventId,
	kitId,
	excessCount,
	feePerMember,
	totalCharges,
}: TeamMemberPaymentSectionProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedPayment, setSelectedPayment] =
		useState<ExhibitorTeamMemberPayment | null>(null);

	const {
		data: payments,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["exhibitor-team-member-payments", eventId, kitId],
		queryFn: () =>
			getExhibitorTeamMemberPayments({
				eventId,
				exhibitorKitId: kitId,
			}),
	});

	const handlePayNow = () => {
		setSelectedPayment(null);
		setDialogOpen(true);
	};

	const handleResubmit = (payment: ExhibitorTeamMemberPayment) => {
		setSelectedPayment(payment);
		setDialogOpen(true);
	};

	if (isLoading) {
		return <Skeleton className="h-32 w-full" />;
	}

	if (error) {
		return (
			<div className="rounded-none border border-red-200 bg-red-50 p-4 text-center text-red-600 text-sm">
				Failed to load payment information.
			</div>
		);
	}

	// Check if there's a payment that's not yet verified (pending, submitted, or rejected awaiting resubmit)
	const hasUnresolvedPayment = payments?.some(
		(p) => p.status === "pending" || p.status === "submitted" || p.status === "rejected",
	);

	// Only show "Pay Now" if:
	// 1. There are unpaid excess members
	// 2. No unresolved payment exists (rejected should be resubmitted, not duplicated)
	const canPayNow = excessCount > 0 && !hasUnresolvedPayment;

	// If no excess and no payments, don't render anything
	if (excessCount === 0 && (!payments || payments.length === 0)) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 border-b pb-2">
				<CreditCard className="size-4 text-muted-foreground" />
				<h3 className="font-medium text-sm">Extra Team Member Payments</h3>
			</div>

			{/* Pay Now Card - Only show if can pay */}
			{canPayNow && (
				<div className="rounded-none border border-amber-200 bg-amber-50 p-4 dark:bg-amber-950/20">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<Users className="size-4 text-amber-600" />
								<span className="font-medium text-amber-700">
									{excessCount} Extra Team Member{excessCount !== 1 ? "s" : ""}
								</span>
							</div>
							<p className="text-amber-600 text-sm">
								Additional charge: RM {totalCharges.toFixed(2)} ({excessCount} ×
								RM {feePerMember.toFixed(2)})
							</p>
						</div>
						<Button onClick={handlePayNow} className="rounded-none">
							<Upload className="mr-2 size-4" />
							Pay Now
						</Button>
					</div>
				</div>
			)}

			{/* Existing Payments List */}
			{payments && payments.length > 0 && (
				<div className="space-y-3">
					{payments.map((payment) => {
						const config = getStatusConfig(payment.status);
						const StatusIcon = config.icon;
						const canResubmit = payment.status === "rejected";

						return (
							<div
								key={payment.id}
								className="rounded-none border bg-background p-4"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="space-y-2">
										<Badge
											variant="outline"
											className={cn("gap-1 rounded-none", config.badgeStyle)}
										>
											<StatusIcon className="size-3" />
											{config.label}
										</Badge>
										<p className="font-bold text-xl">
											RM {payment.amount.toFixed(2)}
										</p>
										<p className="text-muted-foreground text-xs">
											{payment.extraMemberCount} extra member
											{payment.extraMemberCount !== 1 ? "s" : ""} × RM{" "}
											{payment.feePerMember.toFixed(2)}
										</p>
									</div>

									<div className="flex items-center gap-2">
										{payment.paymentProofUrl && (
											<Button
												variant="outline"
												className="gap-2 rounded-none"
												asChild
											>
												<a
													href={payment.paymentProofUrl}
													target="_blank"
													rel="noopener noreferrer"
												>
													<ExternalLink className="size-4" />
													View Proof
												</a>
											</Button>
										)}

										{canResubmit && (
											<Button
												className="gap-2 rounded-none"
												onClick={() => handleResubmit(payment)}
											>
												<Upload className="size-4" />
												Resubmit
											</Button>
										)}

										{payment.status === "verified" && (
											<Badge className="rounded-none bg-green-600">
												<CheckCircle2 className="mr-1 size-3" />
												Paid
											</Badge>
										)}
									</div>
								</div>

								{/* Rejection Notice */}
								{payment.status === "rejected" && (
									<div className="mt-3 rounded-none border border-red-200 bg-red-50 p-3 text-sm">
										<p className="mb-1 font-medium text-red-600">
											Payment Rejected
										</p>
										{payment.note ? (
											<p className="text-red-600">Reason: {payment.note}</p>
										) : (
											<p className="text-red-500">
												Please resubmit with a valid payment proof.
											</p>
										)}
									</div>
								)}

								{/* Reference */}
								{payment.externalRef && (
									<div className="mt-3 border-t pt-2 text-muted-foreground text-xs">
										Ref: {payment.externalRef}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			{/* Payment Dialog */}
			<SubmitTeamMemberPaymentDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				eventId={eventId}
				kitId={kitId}
				extraMemberCount={excessCount}
				feePerMember={feePerMember}
				totalAmount={totalCharges}
				existingPayment={selectedPayment}
			/>
		</div>
	);
}
