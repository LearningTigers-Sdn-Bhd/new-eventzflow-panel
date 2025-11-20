"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorState, LoadingState } from "@/components/data-state";
import { getEventVendorColumns } from "@/components/pages/event-vendors/table/columns";
import { DataTable } from "@/components/pages/event-vendors/table/data-table";
import { Button } from "@/components/ui/button";
import { getEventVendors } from "@/lib/api/event-vendor";

interface VendorsListViewProps {
	eventId: string;
	canManageVendors: boolean;
}

/**
 * Component for admins to view and manage event vendors list
 */
export function VendorsListView({ eventId, canManageVendors }: VendorsListViewProps) {
	const {
		data: vendors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId, "vendors"],
		queryFn: () => getEventVendors(Number(eventId)),
	});

	const columns = getEventVendorColumns(canManageVendors);

	if (isLoading) {
		return (
			<LoadingState
				title="Loading event vendors..."
				description="Please wait while we fetch event vendors..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load event vendors"
				description="We couldn't load event vendors. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	return (
		<div className="space-y-4">
			<DataTable columns={columns} data={vendors || []} />
		</div>
	);
}
