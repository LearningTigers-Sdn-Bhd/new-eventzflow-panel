"use client";

import { useQuery } from "@tanstack/react-query";
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
		<div className="container mx-auto">
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
