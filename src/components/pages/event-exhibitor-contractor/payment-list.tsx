"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getExhibitorKitPayments, type ExhibitorKitPayment } from "@/lib/api/exhibitor-kit-payment";
import { cn } from "@/lib/utils";

interface PaymentListProps {
	eventId: string;
	kitId: string;
	onVerifyPayment?: (payment: ExhibitorKitPayment) => void;
	onRejectPayment?: (payment: ExhibitorKitPayment) => void;
}

const getStatusIcon = (status: ExhibitorKitPayment["status"]) => {
	switch (status) {
		case "pending":
			return <Clock className="size-4" />;
		case "submitted":
			return <AlertCircle className="size-4" />;
		case "verified":
			return <CheckCircle2 className="size-4" />;
		case "rejected":
			return <XCircle className="size-4" />;
	}
};

const getStatusStyle = (status: ExhibitorKitPayment["status"]) => {
	switch (status) {
		case "pending":
			return "border-yellow-500 text-yellow-500";
		case "submitted":
			return "border-blue-500 text-blue-500";
		case "verified":
			return "border-green-500 text-green-500";
		case "rejected":
			return "border-red-500 text-red-500";
	}
};

export function PaymentList({
	eventId,
	kitId,
	onVerifyPayment,
	onRejectPayment,
}: PaymentListProps) {
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

	if (isLoading) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
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

	const totalAmount = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
	const verifiedAmount = payments?.filter((p) => p.status === "verified").reduce((sum, p) => sum + p.amount, 0) || 0;
	const pendingAmount = payments?.filter((p) => p.status !== "verified" && p.status !== "rejected").reduce((sum, p) => sum + p.amount, 0) || 0;

	return (
		<div className="space-y-4">
			{/* Summary */}
			<div className="grid grid-cols-3 gap-3 text-sm">
				<div className="rounded-none border bg-muted/30 p-3 text-center">
					<p className="text-muted-foreground text-xs">Total</p>
					<p className="font-bold">RM {totalAmount.toFixed(2)}</p>
				</div>
				<div className="rounded-none border border-green-200 bg-green-50 p-3 text-center">
					<p className="text-green-600 text-xs">Verified</p>
					<p className="font-bold text-green-700">RM {verifiedAmount.toFixed(2)}</p>
				</div>
				<div className="rounded-none border border-yellow-200 bg-yellow-50 p-3 text-center">
					<p className="text-yellow-600 text-xs">Pending</p>
					<p className="font-bold text-yellow-700">RM {pendingAmount.toFixed(2)}</p>
				</div>
			</div>

			{/* Payment List */}
			{payments && payments.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{payments.map((payment) => (
						<div
							key={payment.id}
							className="rounded-none border bg-background p-4"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 space-y-2">
									<div className="flex items-center gap-2">
										<Badge
											variant="outline"
											className={cn(
												"gap-1 rounded-none capitalize",
												getStatusStyle(payment.status)
											)}
										>
											{getStatusIcon(payment.status)}
											{payment.status}
										</Badge>
										{payment.paymentSource && (
											<Badge variant="secondary" className="rounded-none text-xs">
												{payment.paymentSource === "manual_bank_in" ? "Bank Transfer" : "Payment Gateway"}
											</Badge>
										)}
									</div>
									<p className="font-bold text-xl">
										RM {payment.amount.toFixed(2)}
									</p>
									{payment.note && (
										<p className="text-muted-foreground text-sm">
											Note: {payment.note}
										</p>
									)}
									{payment.paymentProofUrl && (
										<a
											href={payment.paymentProofUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary text-sm underline"
										>
											View Payment Proof
										</a>
									)}
									{payment.externalRef && (
										<p className="text-muted-foreground text-xs">
											Ref: {payment.externalRef}
										</p>
									)}
									<p className="text-muted-foreground text-xs">
										Created: {new Date(payment.createdAt).toLocaleDateString()}
									</p>
								</div>

								{/* Action Buttons for submitted payments */}
								{payment.status === "submitted" && (
									<div className="flex flex-col gap-2">
										{onVerifyPayment && (
											<Button
												size="sm"
												variant="outline"
												className="rounded-none border-green-500 text-green-600 hover:bg-green-50"
												onClick={() => onVerifyPayment(payment)}
											>
												<CheckCircle2 className="mr-1 size-4" />
												Verify
											</Button>
										)}
										{onRejectPayment && (
											<Button
												size="sm"
												variant="outline"
												className="rounded-none border-red-500 text-red-600 hover:bg-red-50"
												onClick={() => onRejectPayment(payment)}
											>
												<XCircle className="mr-1 size-4" />
												Reject
											</Button>
										)}
									</div>
								)}
							</div>

							{/* Linked Items/Printings */}
							{((payment.items && payment.items.length > 0) || (payment.printings && payment.printings.length > 0)) && (
								<div className="mt-3 border-t pt-3">
									<p className="mb-2 text-muted-foreground text-xs uppercase">Linked Items</p>
									<div className="flex flex-wrap gap-2">
										{payment.items?.map((item) => (
											<Badge key={item.id} variant="secondary" className="rounded-none text-xs">
												{item.rentableItem?.name || `Item #${item.rentableItemId}`} x{item.quantity}
											</Badge>
										))}
										{payment.printings?.map((printing) => (
											<Badge key={printing.id} variant="secondary" className="rounded-none text-xs">
												{printing.printingService?.name || `Service #${printing.printingServiceId}`} x{printing.quantity}
											</Badge>
										))}
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			) : (
				<div className="rounded-none border border-dashed p-8 text-center">
					<CreditCard className="mx-auto mb-3 size-8 text-muted-foreground" />
					<p className="mb-1 font-medium">No Payments Yet</p>
					<p className="text-muted-foreground text-sm">
						Payments will appear here when the exhibitor submits their order.
					</p>
				</div>
			)}
		</div>
	);
}
