"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { use } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { ExportLogTable } from "@/components/pages/export-log/export-log-table";
import { columns } from "@/components/pages/export-log/export-log-table-columns";
import { ExportLogPageButton } from "@/components/pages/export-log/page-action/button";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { createExportLog, getExportLogs } from "@/lib/api/event/export-log";

export default function ExportLogsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const queryClient = useQueryClient();

	const {
		data: exportLogs,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", event_id, "export-logs"],
		queryFn: () => getExportLogs({ eventId: event_id }),
	});

	const createExportMutation = useMutation({
		mutationFn: (params: { from?: string; to?: string }) =>
			createExportLog({ eventId: event_id, ...params }),
		onSuccess: (newExport) => {
			// Invalidate and refetch the export logs
			queryClient.invalidateQueries({
				queryKey: ["event", event_id, "export-logs"],
			});
			toast.success(
				`Export #${newExport.id} created successfully! The list will refresh automatically.`,
			);
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create export. Please try again.",
			);
		},
	});

	const handleCreateExport = (from?: string, to?: string) => {
		createExportMutation.mutate({ from, to });
	};

	useSetEventActions(
		<ExportLogPageButton
			onCreateExport={handleCreateExport}
			isCreating={createExportMutation.isPending}
		/>,
	);

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
				<ExportLogTable columns={columns} data={exportLogs || []} />
			)}
		</div>
	);
}
