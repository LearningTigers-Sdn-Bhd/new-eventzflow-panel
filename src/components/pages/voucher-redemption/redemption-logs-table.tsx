"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getRedemptionLogs } from "@/lib/api/voucher-redemption-log";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";

/**
 * Table component to display voucher redemption logs
 */
export function RedemptionLogsTable() {
	const params = useParams();
	const eventId = params?.event_id ? Number(params.event_id) : undefined;

	const {
		data: logs,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["voucher-redemption-logs", eventId],
		queryFn: () => {
			if (!eventId) {
				throw new Error("Event ID is required");
			}
			return getRedemptionLogs({ event_id: eventId });
		},
		enabled: !!eventId, // Only run query if eventId exists
		refetchInterval: 30000, // Refetch every 30 seconds
	});

	// Loading state
	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						Loading redemption logs...
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
							: "Failed to load redemption logs"}
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

	// Render data table
	return <DataTable columns={columns} data={logs || []} />;
}
