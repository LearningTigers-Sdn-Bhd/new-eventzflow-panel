"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, Receipt, RefreshCw } from "lucide-react";
import { use } from "react";
import { EmptyState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import { DataTable } from "@/components/pages/voucher-redemption/table/voucher-log-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { getEventById } from "@/lib/api/event";
import { getRedemptionLogs } from "@/lib/api/voucher-redemption-log";

export default function VoucherLogsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const eventId = Number(event_id);

	// Check permissions - only org_owner, organizer, event_admin can view
	const permissions = useEventPermissions(event_id);
	const { data: event, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
	});

	if (!isLoadingEvent && event?.use_voucher !== true) {
		return (
			<FeatureLockedState
				isEventVendor={permissions.isEventVendor}
				featureName="Vouchers"
			/>
		);
	}

	const {
		data: logs,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["voucher-redemption-logs", eventId],
		queryFn: () => getRedemptionLogs({ event_id: eventId }),
		enabled: !!eventId,
		refetchInterval: 30000, // Refetch every 30 seconds
	});

	// Permission check - vendors should not see this page
	if (permissions.isEventVendor && !permissions.canManageEventVendors) {
		return (
			<EmptyState
				title="Access Denied"
				description="You don't have permission to view voucher logs."
				icon={<Receipt />}
				height="h-[50vh]"
			/>
		);
	}

	// Loading state
	if (isLoading || isLoadingEvent) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="text-muted-foreground text-sm">
						Loading voucher logs...
					</p>
				</div>
			</div>
		);
	}

	// Error state
	if (isError) {
		return (
			<Alert variant="destructive" className="rounded-none">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription className="flex items-center justify-between">
					<span>
						{error instanceof Error
							? error.message
							: "Failed to load voucher logs"}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						className="ml-4"
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						Retry
					</Button>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-4">
			<DataTable data={logs || []} />
		</div>
	);
}
