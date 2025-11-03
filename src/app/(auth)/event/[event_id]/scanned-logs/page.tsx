"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useMemo } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { columns } from "@/components/pages/scanned-log/columns";
import { DataTable } from "@/components/pages/scanned-log/data-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getEventStaff } from "@/lib/api/event/event-staff";
import { getScanLogs } from "@/lib/api/event/scan-log";

interface ScannedLogsPageProps {
	params: Promise<{ event_id: string }>;
}

export default function ScannedLogsPage({ params }: ScannedLogsPageProps) {
	const { event_id } = use(params);
	const { user: currentUser } = useAuth();

	const {
		data: scannedLogs,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["event", event_id, "scan-logs"],
		queryFn: () => getScanLogs({ eventId: event_id }),
	});

	// Fetch event staff
	const { data: eventStaff } = useQuery({
		queryKey: ["event", event_id, "staff"],
		queryFn: () => getEventStaff({ eventId: event_id }),
	});

	// Check if current user has permission to scan tickets
	const canScanTickets = useMemo(() => {
		if (!currentUser || !eventStaff) return false;

		const userStaffAssignment = eventStaff.find(
			(staff: { id: string; eventRole: string }) =>
				String(staff.id) === String(currentUser.id),
		);

		if (!userStaffAssignment) return false;

		return (
			userStaffAssignment.eventRole === "event_admin" ||
			userStaffAssignment.eventRole === "event_team_member"
		);
	}, [currentUser, eventStaff]);

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading scanned logs..."
					description="Please wait while we fetch your scanned logs..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load scanned logs"
					description="We couldn't load scanned logs. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<DataTable
					columns={columns}
					data={scannedLogs || []}
					eventId={event_id}
					onRefetch={refetch}
					canScanTickets={canScanTickets}
				/>
			)}
		</div>
	);
}
