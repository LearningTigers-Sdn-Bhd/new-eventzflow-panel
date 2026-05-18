"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	CreditCard,
	ExternalLink,
	Package,
	Pencil,
	Printer,
	Upload,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
	type ExhibitorKitPayment,
	getExhibitorKitPayments,
} from "@/lib/api/exhibitor-kit-payment";
import { cn } from "@/lib/utils";
import { SubmitPaymentProofDialog } from "./submit-payment-proof-dialog";

interface ExhibitorPaymentListProps {
	eventId: string;
	kitId: string;
}

const getStatusConfig = (status: ExhibitorKitPayment["status"]) => {
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

export function ExhibitorPaymentList({
	eventId,
	kitId,
}: ExhibitorPaymentListProps) {
	const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
	const [selectedPayment, setSelectedPayment] =
		useState<ExhibitorKitPayment | null>(null);

	const {
		data: payments,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["exhibitor-kit-payments", eventId, kitId],
		queryFn: () =>
			getExhibitorKitPayments({
				eventId,
				exhibitorKitId: kitId,
			}),
	});

	const handleSubmitProof = (payment: ExhibitorKitPayment) => {
		setSelectedPayment(payment);
		setSubmitDialogOpen(true);
	};

	if (isLoading) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-none border border-red-200 bg-red-50 p-4 text-center text-red-600 text-sm">
				Failed to load payments. Please try again.
			</div>
		);
	}

	if (!payments || payments.length === 0) {
		return (
			<div className="rounded-none border border-dashed p-8 text-center">
				<CreditCard className="mx-auto mb-3 size-8 text-muted-foreground" />
				<p className="mb-1 font-medium">No Payments Yet</p>
				<p className="text-muted-foreground text-sm">
					Submit your order to generate a payment request.
				</p>
			</div>
		);
	}

	// Calculate payment summaries
	const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
	const paidAmount = payments
		.filter((p) => p.status === "verified")
		.reduce((sum, p) => sum + p.amount, 0);
	const pendingAmount = payments
		.filter((p) => p.status !== "verified" && p.status !== "rejected")
		.reduce((sum, p) => sum + p.amount, 0);
	const progressPercent =
		totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

	return (
		<div className="space-y-4">
			{/* Payment Summary */}
			<div className="rounded-none border bg-background p-4">
				<div className="mb-4 space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Payment Progress</span>
						<span className="font-medium">
							{progressPercent.toFixed(0)}% Complete
						</span>
					</div>
					<Progress
						value={progressPercent}
						className="h-2 [&>div]:bg-green-500"
					/>
				</div>
				<div className="grid grid-cols-3 gap-3 text-sm">
					<div className="rounded-none border bg-muted/30 p-3 text-center">
						<p className="text-muted-foreground text-xs">Total</p>
						<p className="font-bold">RM {totalAmount.toFixed(2)}</p>
					</div>
					<div className="rounded-none border border-green-200 bg-green-50 p-3 text-center">
						<p className="text-green-600 text-xs">Paid</p>
						<p className="font-bold text-green-700">
							RM {paidAmount.toFixed(2)}
						</p>
					</div>
					<div className="rounded-none border border-amber-200 bg-amber-50 p-3 text-center">
						<p className="text-amber-600 text-xs">Pending</p>
						<p className="font-bold text-amber-700">
							RM {pendingAmount.toFixed(2)}
						</p>
					</div>
				</div>
			</div>

			{/* Payment Cards */}
			{payments.map((payment) => {
				const config = getStatusConfig(payment.status);
				const StatusIcon = config.icon;
				const needsAction =
					payment.status === "pending" || payment.status === "rejected";
				const hasItems = payment.items && payment.items.length > 0;
				const hasPrintings = payment.printings && payment.printings.length > 0;

				return (
					<div
						key={payment.id}
						className="rounded-none border bg-background p-4"
					>
						{/* Header: Status, Amount & Action */}
						<div className="mb-4 flex items-start justify-between gap-4">
							<div className="space-y-1">
								<Badge
									variant="outline"
									className={cn("gap-1 rounded-none", config.badgeStyle)}
								>
									<StatusIcon className="size-3" />
									{config.label}
								</Badge>
								<p className="font-bold text-2xl">
									RM {payment.amount.toFixed(2)}
								</p>
								<p className="text-muted-foreground text-sm">
									Pay to:{" "}
									<span className="font-medium text-foreground">
										{payment.payeeName}
									</span>
								</p>
							</div>

							{/* Action Buttons - Top Right */}
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

								{needsAction && (
									<Button
										className="gap-2 rounded-none"
										onClick={() => handleSubmitProof(payment)}
									>
										<Upload className="size-4" />
										{payment.status === "rejected" ? "Resubmit" : "Pay Now"}
									</Button>
								)}

								{payment.status === "submitted" && (
									<Button
										variant="outline"
										className="gap-2 rounded-none"
										onClick={() => handleSubmitProof(payment)}
									>
										<Pencil className="size-4" />
										Edit
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
							<div className="mb-4 rounded-none border border-red-200 bg-red-50 p-3 text-sm">
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

						{/* Items & Services List - Two Column Layout */}
						{(hasItems || hasPrintings) && (
							<>
								<Separator className="mb-4" />
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									{/* Rentable Items - Left Column */}
									<div className="rounded-none border bg-muted/20 p-3">
										<div className="mb-3 flex items-center gap-2 border-b pb-2 font-medium text-muted-foreground text-xs uppercase">
											<Package className="size-3" />
											Items
										</div>
										{hasItems ? (
											<div className="space-y-2">
												{payment.items?.map((item) => (
													<div
														key={item.id}
														className="flex items-center justify-between text-sm"
													>
														<span>
															{item.rentableItem?.name ||
																`Item #${item.rentableItemId}`}
															<span className="text-muted-foreground">
																{" "}
																x{item.quantity}
															</span>
														</span>
														<span className="font-medium">
															RM {(item.agreedPrice * item.quantity).toFixed(2)}
														</span>
													</div>
												))}
											</div>
										) : (
											<p className="py-2 text-center text-muted-foreground text-sm">
												No items
											</p>
										)}
									</div>

									{/* Printing Services - Right Column */}
									<div className="rounded-none border bg-muted/20 p-3">
										<div className="mb-3 flex items-center gap-2 border-b pb-2 font-medium text-muted-foreground text-xs uppercase">
											<Printer className="size-3" />
											Printing Services
										</div>
										{hasPrintings ? (
											<div className="space-y-2">
												{payment.printings?.map((printing) => (
													<div
														key={printing.id}
														className="flex items-center justify-between text-sm"
													>
														<span>
															{printing.printingService?.name ||
																`Service #${printing.printingServiceId}`}
															<span className="text-muted-foreground">
																{" "}
																x{printing.quantity}
															</span>
														</span>
														<span className="font-medium">
															RM{" "}
															{(
																printing.agreedPrice * printing.quantity
															).toFixed(2)}
														</span>
													</div>
												))}
											</div>
										) : (
											<p className="py-2 text-center text-muted-foreground text-sm">
												No printing services
											</p>
										)}
									</div>
								</div>
							</>
						)}

						{/* Payment Reference (if submitted) */}
						{payment.externalRef && (
							<>
								<Separator className="my-4" />
								<div className="text-muted-foreground text-xs">
									Ref: {payment.externalRef}
								</div>
							</>
						)}
					</div>
				);
			})}

			{/* Submit Proof Dialog */}
			<SubmitPaymentProofDialog
				open={submitDialogOpen}
				onOpenChange={setSubmitDialogOpen}
				payment={selectedPayment}
				eventId={eventId}
				kitId={kitId}
			/>
		</div>
	);
}
