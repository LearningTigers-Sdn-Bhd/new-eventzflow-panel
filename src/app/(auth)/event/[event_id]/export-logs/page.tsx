"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { columns } from "@/components/pages/export-log/columns";
import { DataTable } from "@/components/pages/export-log/data-table";
import { ExportLogPageButton } from "@/components/pages/export-log/page-action/button";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getExportLogs } from "@/lib/api/event/export-log";

export default function ExportLogsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);

	useSetEventActions(<ExportLogPageButton />);

	const {
		data: exportLogs,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", event_id, "export-logs"],
		queryFn: () => getExportLogs({ eventId: event_id }),
	});

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading export logs..."
					description="Please wait while we fetch your export logs..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load export logs"
					description="We couldn't load export logs. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<DataTable columns={columns} data={exportLogs || []} />
			)}
		</div>
	);
}
