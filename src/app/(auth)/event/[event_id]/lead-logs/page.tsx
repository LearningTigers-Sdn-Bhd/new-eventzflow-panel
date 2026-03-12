"use client";

import { Stamp } from "lucide-react";
import { use, useMemo } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { ScanLeadButton } from "@/components/pages/event-leads/page-action/scan-lead-button";
import { DataTable } from "@/components/pages/event-leads/lead-log-table";
import { Button } from "@/components/ui/button";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { useEventLeads } from "@/hooks/use-event-leads";

interface LeadLogsPageProps {
	params: Promise<{ event_id: string }>;
}

export default function LeadLogsPage({ params }: LeadLogsPageProps) {
	const { event_id } = use(params);

	// Check permissions - only org_owner, organizer, event_admin can view
	const permissions = useEventPermissions(event_id);

	const { data: leads, isLoading, error, refetch } = useEventLeads(event_id);

	const eventActions = useMemo(
		() => (
			<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
				<ScanLeadButton eventId={event_id} onRefetch={refetch} />
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
				description="You don't have permission to view lead logs."
				icon={<Stamp />}
				height="h-[50vh]"
			/>
		);
	}

	if (isLoading) {
		return (
			<LoadingState
				title="Loading lead logs..."
				description="Please wait while we fetch lead logs..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load lead logs"
				description="We couldn't load lead logs. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	return (
		<div className="space-y-4">
			<DataTable data={leads || []} />
		</div>
	);
}
