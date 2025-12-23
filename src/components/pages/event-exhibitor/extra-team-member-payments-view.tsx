"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getEventVendors } from "@/lib/api/event-vendor";
import { DataTable } from "../exhibitor-kits/my-items/data-table";
import {
	paymentsColumns,
	type TeamMemberPaymentWithVendor,
	type PaymentsTableMeta,
} from "./extra-team-member-payments-columns";
import { VerifyRejectTeamMemberPaymentDialog } from "./verify-reject-team-member-payment-dialog";

interface ExtraTeamMemberPaymentsViewProps {
	eventId: string;
}

type StatusFilter = "all" | "submitted" | "verified" | "rejected" | "pending";

export function ExtraTeamMemberPaymentsView({
	eventId,
}: ExtraTeamMemberPaymentsViewProps) {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedPayment, setSelectedPayment] =
		useState<TeamMemberPaymentWithVendor | null>(null);
	const [dialogAction, setDialogAction] = useState<"verify" | "reject">("verify");

	const {
		data: vendors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId, "vendors"],
		queryFn: () => getEventVendors(Number(eventId)),
	});

	const handleVerify = (payment: TeamMemberPaymentWithVendor) => {
		setSelectedPayment(payment);
		setDialogAction("verify");
		setDialogOpen(true);
	};

	const handleReject = (payment: TeamMemberPaymentWithVendor) => {
		setSelectedPayment(payment);
		setDialogAction("reject");
		setDialogOpen(true);
	};

	if (isLoading) {
		return (
			<LoadingState
				title="Loading payments..."
				description="Please wait while we fetch extra team member payments..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load payments"
				description="We couldn't load payments. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	// Aggregate all payments from all exhibitor kits with vendor info
	const allPayments: TeamMemberPaymentWithVendor[] = [];
	vendors?.forEach((vendor) => {
		if (vendor.exhibitor_kit?.exhibitor_team_member_payments) {
			vendor.exhibitor_kit.exhibitor_team_member_payments.forEach((payment) => {
				allPayments.push({
					...payment,
					vendor_name: vendor.vendor.full_name,
					vendor_email: vendor.vendor.email,
					event_vendor_id: vendor.id,
				});
			});
		}
	});

	// Filter payments by status
	const filteredPayments =
		statusFilter === "all"
			? allPayments
			: allPayments.filter((p) => p.status === statusFilter);

	// Count by status for badges
	const submittedCount = allPayments.filter((p) => p.status === "submitted").length;
	const verifiedCount = allPayments.filter((p) => p.status === "verified").length;
	const rejectedCount = allPayments.filter((p) => p.status === "rejected").length;

	const tableMeta: PaymentsTableMeta = {
		onVerify: handleVerify,
		onReject: handleReject,
	};

	return (
		<div className="space-y-4">
			{/* Status Filter */}
			<div className="flex items-center gap-2">
				<Label className="text-sm text-muted-foreground">Filter:</Label>
				<Select
					value={statusFilter}
					onValueChange={(value) => setStatusFilter(value as StatusFilter)}
				>
					<SelectTrigger className="w-48 rounded-none">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="rounded-none">
						<SelectItem value="all" className="rounded-none">
							All ({allPayments.length})
						</SelectItem>
						<SelectItem value="submitted" className="rounded-none">
							Under Review ({submittedCount})
						</SelectItem>
						<SelectItem value="verified" className="rounded-none">
							Verified ({verifiedCount})
						</SelectItem>
						<SelectItem value="rejected" className="rounded-none">
							Rejected ({rejectedCount})
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Payments Table */}
			<DataTable
				columns={paymentsColumns}
				data={filteredPayments}
				emptyTitle="No extra team member payments"
				emptyDescription="No exhibitors have submitted payments for extra team members yet"
				emptyIcon={<CreditCard />}
				searchPlaceholder="Search exhibitors..."
				searchColumns={["vendor"]}
				meta={tableMeta}
			/>

			{/* Verify/Reject Dialog */}
			<VerifyRejectTeamMemberPaymentDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				payment={selectedPayment}
				eventId={eventId}
				action={dialogAction}
			/>
		</div>
	);
}
