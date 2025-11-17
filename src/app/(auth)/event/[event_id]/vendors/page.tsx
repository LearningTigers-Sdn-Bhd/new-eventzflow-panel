"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { getEventVendorColumns } from "@/components/pages/event-vendors/table/columns";
import { DataTable } from "@/components/pages/event-vendors/table/data-table";
import { EventVendorsPageButton } from "@/components/pages/event-vendors/page-action/button";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventVendors } from "@/lib/api/event-vendor";

export default function EventVendorsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	useSetEventActions(<EventVendorsPageButton />);

	const {
		data: vendors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", event_id, "vendors"],
		queryFn: () => getEventVendors(Number(event_id)),
	});

	const { user } = useAuth();

	// Check permissions
	const { canManageEventVendors } = useEventPermissions(event_id);

	// Get columns based on permissions
	const columns = getEventVendorColumns(canManageEventVendors);

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading event vendors..."
					description="Please wait while we fetch event vendors..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load event vendors"
					description="We couldn't load event vendors. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<DataTable columns={columns} data={vendors || []} />
			)}
		</div>
	);
}
