"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useMemo } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { TicketScanButton } from "@/components/pages/scanned-log/ticket-scan-button";
import { columns } from "@/components/pages/scanned-log/ticket-scanned-log-columns";
import { DataTable } from "@/components/pages/scanned-log/ticket-scanned-log-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
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

	const eventActions = useMemo(
		() => (
			<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
				<TicketScanButton
					eventId={event_id}
					canScanTickets={canScanTickets}
					onRefetch={refetch}
				/>
			</div>
		),
		[canScanTickets, event_id, refetch],
	);

	useSetEventActions(eventActions);

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
				<DataTable columns={columns} data={scannedLogs || []} />
			)}
		</div>
	);
}
