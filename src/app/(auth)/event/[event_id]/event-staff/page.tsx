"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { getEventStaffColumns } from "@/components/pages/event-staff/columns";
import { DataTable } from "@/components/pages/event-staff/data-table";
import { EventStaffPageButton } from "@/components/pages/event-staff/page-action/button";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventStaff } from "@/lib/api/event/event-staff";

export default function EventStaffPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	useSetEventActions(<EventStaffPageButton />);

	const {
		data: eventStaff,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", event_id, "staff"],
		queryFn: () => getEventStaff({ eventId: event_id }),
	});

	const { user } = useAuth();

	// Get columns based on user role (only org_owner sees actions)
	const columns = getEventStaffColumns(user?.role);

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 rounded-none border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<Info className="size-4 text-muted-foreground mt-0.5 shrink-0" />
					<div className="space-y-1">
						<p className="text-sm font-medium">Assign staff to this event</p>
						<p className="text-sm text-muted-foreground">
							This page shows staff assigned to this event. To add new team members, go to the Team page.
						</p>
					</div>
				</div>
				<Button variant="outline" asChild className="w-full rounded-none sm:w-auto sm:shrink-0">
					<Link href="/team">
						Go to Team
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</div>
			{isLoading ? (
				<LoadingState
					title="Loading event staff..."
					description="Please wait while we fetch event staff members..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load event staff"
					description="We couldn't load event staff members. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<DataTable columns={columns} data={eventStaff || []} />
			)}
		</div>
	);
}
