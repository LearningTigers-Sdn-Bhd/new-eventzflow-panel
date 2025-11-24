"use client";

import { use, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { getVoucherColumns } from "@/components/pages/vouchers/table/columns";
import { DataTable } from "@/components/pages/vouchers/table/data-table";
import { VouchersPageButton } from "@/components/pages/vouchers/page-action/button";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getVouchers } from "@/lib/api/voucher";
import { Ticket } from "lucide-react";

export default function VouchersPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { user } = useAuth();

	// Check permissions
	const { canManageEventVendors, isEventVendor } = useEventPermissions(event_id);

	// Only show action button for event admins and vendors
	useSetEventActions(
		canManageEventVendors || isEventVendor ? <VouchersPageButton /> : null
	);

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

	// Filter vouchers by vendor if user is a vendor
	const filteredVouchers = useMemo(() => {
		if (!vouchers) return [];
		
		// If user is a vendor (not admin), only show their vouchers
		if (isEventVendor && !canManageEventVendors && user) {
			return vouchers.filter((voucher) => voucher.vendorId === user.id);
		}
		
		// Event admins see all vouchers
		return vouchers;
	}, [vouchers, isEventVendor, canManageEventVendors, user]);

	// Get columns based on permissions
	const columns = getVoucherColumns(canManageEventVendors || isEventVendor);

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
			) : (
				<DataTable columns={columns} data={filteredVouchers || []} />
			)}
		</div>
	);
}
