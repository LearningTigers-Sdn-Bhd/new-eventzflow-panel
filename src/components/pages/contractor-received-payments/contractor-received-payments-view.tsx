"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	getReceivedPayments,
	type ReceivedPayment,
} from "@/lib/api/received-payment";
import { DataTable } from "../exhibitor-kits/my-items/data-table";
import {
	type ReceivedPaymentsTableMeta,
	receivedPaymentsColumns,
} from "./received-payments-columns";
import { VerifyRejectReceivedPaymentDialog } from "./verify-reject-received-payment-dialog";

interface ContractorReceivedPaymentsViewProps {
	eventId: string;
}

export function ContractorReceivedPaymentsView({
	eventId,
}: ContractorReceivedPaymentsViewProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedPayment, setSelectedPayment] =
		useState<ReceivedPayment | null>(null);
	const [dialogAction, setDialogAction] = useState<"verify" | "reject">(
		"verify",
	);

	const {
		data: payments,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId, "received-payments"],
		queryFn: () => getReceivedPayments({ eventId }),
	});

	const handleVerify = (payment: ReceivedPayment) => {
		setSelectedPayment(payment);
		setDialogAction("verify");
		setDialogOpen(true);
	};

	const handleReject = (payment: ReceivedPayment) => {
		setSelectedPayment(payment);
		setDialogAction("reject");
		setDialogOpen(true);
	};

	if (isLoading) {
		return (
			<LoadingState
				title="Loading payments..."
				description="Please wait while we fetch your received payments..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load payments"
				description="We couldn't load your payments. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	const tableMeta: ReceivedPaymentsTableMeta = {
		onVerify: handleVerify,
		onReject: handleReject,
	};

	return (
		<div className="space-y-4">
			<DataTable
				columns={receivedPaymentsColumns}
				data={payments || []}
				emptyTitle="No payments found"
				emptyDescription="You haven't received any payments for this event yet"
				emptyIcon={<CreditCard />}
				searchPlaceholder="Search by exhibitor..."
				searchColumns={["exhibitorInfo"]}
				meta={tableMeta}
			/>

			{/* Verify/Reject Dialog */}
			<VerifyRejectReceivedPaymentDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				payment={selectedPayment}
				eventId={eventId}
				action={dialogAction}
			/>
		</div>
	);
}
