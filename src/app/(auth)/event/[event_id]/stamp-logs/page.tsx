"use client";

import { use } from "react";
import { Stamp } from "lucide-react";
import { ErrorState, LoadingState, EmptyState } from "@/components/data-state";
import { columns } from "@/components/pages/visitor-stamps/columns";
import { DataTable } from "@/components/pages/visitor-stamps/data-table";
import { Button } from "@/components/ui/button";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useEventStamps } from "@/hooks/use-visitor-stamps";

interface StampLogsPageProps {
	params: Promise<{ event_id: string }>;
}

export default function StampLogsPage({ params }: StampLogsPageProps) {
	const { event_id } = use(params);

	// Check permissions - only org_owner, organizer, event_admin can view
	const permissions = useEventPermissions(event_id);

	const {
		data: stamps,
		isLoading,
		error,
		refetch,
	} = useEventStamps(event_id);

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
			<DataTable
				columns={columns}
				data={stamps || []}
				eventId={event_id}
				onRefetch={refetch}
			/>
		</div>
	);
}
