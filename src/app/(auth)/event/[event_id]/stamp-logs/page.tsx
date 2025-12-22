"use client";

import { Stamp } from "lucide-react";
import { use, useMemo } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { ScanStampButton } from "@/components/pages/visitor-stamps/page-action/scan-stamp-button";
import { DataTable } from "@/components/pages/visitor-stamps/stamp-log-table";
import { Button } from "@/components/ui/button";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { useEventStamps } from "@/hooks/use-visitor-stamps";

interface StampLogsPageProps {
	params: Promise<{ event_id: string }>;
}

export default function StampLogsPage({ params }: StampLogsPageProps) {
	const { event_id } = use(params);

	// Check permissions - only org_owner, organizer, event_admin can view
	const permissions = useEventPermissions(event_id);

	const { data: stamps, isLoading, error, refetch } = useEventStamps(event_id);

	const eventActions = useMemo(
		() => (
			<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
				<ScanStampButton eventId={event_id} onRefetch={refetch} />
			</div>
		),
		[event_id, refetch],
	);

	useSetEventActions(eventActions);

	// Permission check - vendors should not see this page
	if (permissions.isEventVendor && !permissions.canManageEventVendors) {
		return (
			<EmptyState
				title="Access Denied"
				description="You don't have permission to view stamp logs."
				icon={<Stamp />}
				height="h-[50vh]"
			/>
		);
	}

	if (isLoading) {
		return (
			<LoadingState
				title="Loading stamp logs..."
				description="Please wait while we fetch stamp logs..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load stamp logs"
				description="We couldn't load stamp logs. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	return (
		<div className="space-y-4">
			<DataTable data={stamps || []} />
		</div>
	);
}
