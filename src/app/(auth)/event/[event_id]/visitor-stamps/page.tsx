"use client";

import { use, useMemo } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { ScanStampButton } from "@/components/pages/visitor-stamps/page-action/scan-stamp-button";
import { DataTable } from "@/components/pages/visitor-stamps/stamp-log-table";
import { Button } from "@/components/ui/button";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { useEventStamps } from "@/hooks/use-visitor-stamps";

interface VisitorStampsPageProps {
	params: Promise<{ event_id: string }>;
}

export default function VisitorStampsPage({ params }: VisitorStampsPageProps) {
	const { event_id } = use(params);

	const { data: visitorStamps, isLoading, error, refetch } = useEventStamps(event_id);

	const eventActions = useMemo(
		() => (
			<div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row">
				<ScanStampButton eventId={event_id} onRefetch={refetch} />
			</div>
		),
		[event_id, refetch],
	);

	useSetEventActions(eventActions);

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading visitor stamps..."
					description="Please wait while we fetch your visitor stamps..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load visitor stamps"
					description="We couldn't load visitor stamps. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<DataTable data={visitorStamps || []} />
			)}
		</div>
	);
}
