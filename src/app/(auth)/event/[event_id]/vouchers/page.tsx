"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { getVoucherColumns } from "@/components/pages/vouchers/table/columns";
import { DataTable } from "@/components/pages/vouchers/table/data-table";
import { VouchersPageButton } from "@/components/pages/vouchers/page-action/button";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getVouchers } from "@/lib/api/voucher";
import { Ticket } from "lucide-react";

export default function VouchersPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	useSetEventActions(<VouchersPageButton />);

	// Fetch vouchers from API
	const {
		data: vouchers,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["event", event_id, "vouchers"],
		queryFn: () => getVouchers({ event_id: Number(event_id) }),
	});

	// Get columns
	const columns = getVoucherColumns(true); // true = can manage vouchers

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading vouchers..."
					description="Please wait while we fetch vouchers..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load vouchers"
					description="We couldn't load vouchers. Please try again."
					action={
						<Button onClick={() => refetch()}>Retry</Button>
					}
				/>
			) : !vouchers || vouchers.length === 0 ? (
				<EmptyState
					title="No vouchers found"
					description="Create vouchers to get started"
					icon={<Ticket className="size-12" />}
					height="h-[400px]"
				/>
			) : (
				<DataTable columns={columns} data={vouchers} />
			)}
		</div>
	);
}
