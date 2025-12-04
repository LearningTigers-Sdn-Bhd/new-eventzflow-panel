"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { getEventVendors } from "@/lib/api/event-vendor";
import { columns } from "./table/columns";
import { DataTable } from "./table/data-table";

interface ExhibitorListViewProps {
	eventId: string;
	canManageVendors: boolean;
}

/**
 * Component for admins to view and manage exhibitors list
 */
export function ExhibitorListView({ eventId, canManageVendors }: ExhibitorListViewProps) {
	const {
		data: vendors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId, "vendors"],
		queryFn: () => getEventVendors(Number(eventId)),
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading exhibitors..."
				description="Please wait while we fetch exhibitors..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load exhibitors"
				description="We couldn't load exhibitors. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 rounded-none border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
					<div className="space-y-1">
						<p className="text-sm font-medium">Assign exhibitors to this event</p>
						<p className="text-sm text-muted-foreground">
							This page shows exhibitors assigned to this event. To create new vendors, go to the Vendors page.
						</p>
					</div>
				</div>
				<Button variant="outline" asChild className="w-full rounded-none sm:w-auto sm:shrink-0">
					<Link href="/vendor">
						Go to Vendors
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</div>
			<DataTable columns={columns} data={vendors || []} canManageVendors={canManageVendors} />
		</div>
	);
}
