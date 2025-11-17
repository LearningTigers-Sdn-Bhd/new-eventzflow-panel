"use client";

import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { columns } from "@/components/pages/visitor-stamps/columns";
import { DataTable } from "@/components/pages/visitor-stamps/data-table";
import { Button } from "@/components/ui/button";
import { useEventStamps } from "@/hooks/use-visitor-stamps";

interface VisitorStampsPageProps {
	params: Promise<{ event_id: string }>;
}

export default function VisitorStampsPage({ params }: VisitorStampsPageProps) {
	const { event_id } = use(params);

	const {
		data: visitorStamps,
		isLoading,
		error,
		refetch,
	} = useEventStamps(event_id);

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
				<DataTable
					columns={columns}
					data={visitorStamps || []}
					eventId={event_id}
					onRefetch={refetch}
				/>
			)}
		</div>
	);
}
