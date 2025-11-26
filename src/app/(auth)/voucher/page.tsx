"use client";

import { useQueries } from "@tanstack/react-query";
import { Ticket } from "lucide-react";
import { useMemo } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { vendorVoucherColumns, type VendorVoucher } from "@/components/pages/vendor-vouchers/table/columns";
import { VendorVoucherDataTable } from "@/components/pages/vendor-vouchers/table/data-table";
import { VendorVouchersPageButton } from "@/components/pages/vendor-vouchers/page-action/button";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useAuth } from "@/hooks/use-auth";
import { useHydratedStore } from "@/hooks/use-hydrated-store";
import { getVouchers } from "@/lib/api/voucher";
import { getEvents } from "@/lib/api/event";

export default function VendorVouchersPage() {
	const { user } = useAuth();
	const isHydrated = useHydratedStore();

	// Fetch vouchers and events in parallel
	const [
		{ data: vouchers, isLoading: isLoadingVouchers, error: vouchersError, refetch },
		{ data: events, isLoading: isLoadingEvents },
	] = useQueries({
		queries: [
			{
				queryKey: ["vendor-vouchers", user?.id],
				queryFn: () => getVouchers({ vendor_id: user?.id }),
				enabled: isHydrated && !!user?.id,
			},
			{
				queryKey: ["events"],
				queryFn: () => getEvents(),
				enabled: isHydrated,
			},
		],
	});

	const isLoading = isLoadingVouchers || isLoadingEvents;
	const error = vouchersError;

	// Map event names to vouchers
	const vouchersWithEvent: VendorVoucher[] = useMemo(() => {
		if (!vouchers) return [];
		
		const eventMap = new Map(events?.map((e) => [e.id, e.title]) || []);
		
		return vouchers.map((voucher) => ({
			...voucher,
			eventName: eventMap.get(voucher.eventId) || `Event #${voucher.eventId}`,
		}));
	}, [vouchers, events]);

	return (
		<div className="space-y-0">
			{/* Header */}
			<div className="page-header mb-6">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={Ticket}
						title="My Vouchers"
						description="Manage all your vouchers across events"
					/>
				</div>
				<div className="w-full px-0 md:w-auto md:px-4">
					<VendorVouchersPageButton />
				</div>
			</div>

			{/* Content */}
			{isLoading ? (
				<LoadingState
					title="Loading vouchers..."
					description="Please wait while we fetch your vouchers..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load vouchers"
					description="We couldn't load your vouchers. Please try again."
					action={<Button onClick={() => refetch()}>Retry</Button>}
				/>
			) : !vouchersWithEvent || vouchersWithEvent.length === 0 ? (
				<EmptyState
					title="No vouchers yet"
					description="Create your first voucher to start offering discounts to customers."
					icon={<Ticket className="size-8" />}
					height="h-[400px]"
				/>
			) : (
				<VendorVoucherDataTable columns={vendorVoucherColumns} data={vouchersWithEvent} />
			)}
		</div>
	);
}
