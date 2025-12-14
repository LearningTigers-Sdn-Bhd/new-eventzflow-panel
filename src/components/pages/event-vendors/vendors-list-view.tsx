"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";
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
export function VendorsListView({
	eventId,
	canManageVendors,
}: VendorsListViewProps) {
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
			<div className="flex flex-col gap-3 rounded-none border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
					<div className="space-y-1">
						<p className="font-medium text-sm">Assign vendors to this event</p>
						<p className="text-muted-foreground text-sm">
							This page shows vendors assigned to this event. To create new
							vendors, go to the Vendors page.
						</p>
					</div>
				</div>
				<Button
					variant="outline"
					asChild
					className="w-full rounded-none sm:w-auto sm:shrink-0"
				>
					<Link href="/vendor">
						Go to Vendors
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</div>
			<DataTable columns={columns} data={vendors || []} />
		</div>
	);
}
