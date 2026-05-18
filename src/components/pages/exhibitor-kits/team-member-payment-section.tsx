"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	CreditCard,
	ExternalLink,
	Upload,
	Users,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type CreateRazorpayOrderResponse,
	createExtraTeamMemberPaymentOrder,
	type ExhibitorTeamMemberPayment,
	getExhibitorTeamMemberPayments,
	verifyExtraTeamMemberPayment,
} from "@/lib/api/exhibitor-team-member-payment";
import { cn } from "@/lib/utils";
import { SubmitTeamMemberPaymentDialog } from "./submit-team-member-payment-dialog";

type RazorpayInstance = {
	open: () => void;
	on?: (event: string, callback: () => void) => void;
};

type RazorpayConstructor = new (
	options: Record<string, unknown>,
) => RazorpayInstance;

async function loadRazorpayCheckoutScript() {
	if ((window as Window & { Razorpay?: RazorpayConstructor }).Razorpay) {
		return true;
	}

	return new Promise<boolean>((resolve) => {
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);
		document.body.appendChild(script);
	});
}

export function usesGatewayPaymentMode(
	paymentMode?: "manual_bank_in" | "payment_gateway" | null,
) {
	return paymentMode === "payment_gateway";
}

export function showsPendingGatewayAction(payment: {
	status: ExhibitorTeamMemberPayment["status"];
	paymentSource: ExhibitorTeamMemberPayment["paymentSource"];
}) {
	return (
		payment.status === "pending" && payment.paymentSource === "payment_gateway"
	);
}

export function getRazorpayRedirectOptions(
	order: CreateRazorpayOrderResponse["data"],
) {
	if (!order.callback_url) {
		return {};
	}

	return {
		callback_url: order.callback_url,
		redirect: true,
	};
}

function isValidRazorpayOrder(order: CreateRazorpayOrderResponse["data"]) {
	return Boolean(order.key_id && order.order_id && order.amount);
}

interface TeamMemberPaymentSectionProps {
	eventId: string;
	kitId: string;
	// Current excess member info (for creating new payment)
	excessCount: number;
	feePerMember: number;
	totalCharges: number;
	paymentMode?: "manual_bank_in" | "payment_gateway";
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
	paymentMode,
}: TeamMemberPaymentSectionProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedPayment, setSelectedPayment] =
		useState<ExhibitorTeamMemberPayment | null>(null);
	const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
	const queryClient = useQueryClient();

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

	const hasPaymentGateway = usesGatewayPaymentMode(paymentMode);

	const handlePayNow = async () => {
		if (hasPaymentGateway) {
			await handleRazorpayPayment();
			return;
		}

		setSelectedPayment(null);
		setDialogOpen(true);
	};

	const handleRazorpayPayment = async () => {
		try {
			setIsRazorpayLoading(true);

			const order = await createExtraTeamMemberPaymentOrder({
				eventId,
				exhibitorKitId: kitId,
			});

			if (!isValidRazorpayOrder(order)) {
				throw new Error("Payment order response is incomplete.");
			}

			const isScriptLoaded = await loadRazorpayCheckoutScript();
			const Razorpay = (window as Window & { Razorpay?: RazorpayConstructor })
				.Razorpay;

			if (!isScriptLoaded || !Razorpay) {
				throw new Error("Unable to load Razorpay checkout script.");
			}

			const razorpay = new Razorpay({
				key: order.key_id,
				amount: order.amount,
				currency: order.currency || "MYR",
				name: "Extra Team Member Payment",
				description: "Payment for extra team members",
				order_id: order.order_id,
				...getRazorpayRedirectOptions(order),
				handler: async (response: {
					razorpay_order_id: string;
					razorpay_payment_id: string;
					razorpay_signature: string;
				}) => {
					try {
						await verifyExtraTeamMemberPayment({
							eventId,
							exhibitorKitId: kitId,
							paymentId: order.payment_id,
							razorpayOrderId: response.razorpay_order_id,
							razorpayPaymentId: response.razorpay_payment_id,
							razorpaySignature: response.razorpay_signature,
						});
						toast.success(
							"Payment successful! Your extra team members have been confirmed.",
						);
						await Promise.all([
							queryClient.invalidateQueries({
								queryKey: ["exhibitor-team-member-payments", eventId, kitId],
							}),
							queryClient.invalidateQueries({
								queryKey: ["event", eventId, "vendors"],
							}),
						]);
					} catch {
						toast.error(
							"Payment verification failed. Please contact the organizer if you were charged.",
						);
					} finally {
						setIsRazorpayLoading(false);
					}
				},
				modal: {
					ondismiss: () => {
						setIsRazorpayLoading(false);
					},
				},
				theme: {
					color: "#000000",
				},
			});

			razorpay.on?.("payment.failed", () => {
				toast.error("Payment failed. Please try again.");
				setIsRazorpayLoading(false);
			});

			razorpay.open();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to initiate payment",
			);
			setIsRazorpayLoading(false);
		}
	};

	const handleResubmit = (payment: ExhibitorTeamMemberPayment) => {
		setSelectedPayment(payment);
		setDialogOpen(true);
	};

	const handleContinueGatewayPayment = async (
		payment: ExhibitorTeamMemberPayment,
	) => {
		if (!usesGatewayPaymentMode(payment.paymentSource)) {
			return;
		}

		await handleRazorpayPayment();
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

	// Check if there's a rejected payment awaiting resubmit
	// Only rejected payments should block new payments (to prevent duplicate payments for same members)
	// Pending/submitted payments don't block - new members added after those payments are independent
	const hasRejectedPayment = payments?.some((p) => p.status === "rejected");

	// Show "Pay Now" if there are unpaid excess members and no rejected payment awaiting resubmit
	const canPayNow = excessCount > 0 && !hasRejectedPayment;

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
						<Button
							onClick={handlePayNow}
							className="rounded-none"
							disabled={isRazorpayLoading}
						>
							{isRazorpayLoading ? (
								"Processing..."
							) : (
								<>
									{hasPaymentGateway ? (
										<CreditCard className="mr-2 size-4" />
									) : (
										<Upload className="mr-2 size-4" />
									)}
									Pay Now
								</>
							)}
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
						const canContinueGatewayPayment =
							showsPendingGatewayAction(payment);

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

										{canContinueGatewayPayment && (
											<Button
												className="gap-2 rounded-none"
												onClick={() => handleContinueGatewayPayment(payment)}
												disabled={isRazorpayLoading}
											>
												<CreditCard className="size-4" />
												{isRazorpayLoading
													? "Processing..."
													: "Continue Payment"}
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
