"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { DataTable } from "@/components/pages/lucky-draw/draw-session-table";
import { LuckyDrawPageButton } from "@/components/pages/lucky-draw/manage-session/index-create-button";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getLuckyDrawSessions } from "@/lib/api/lucky-draw";

interface LuckyDrawPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function LuckyDrawPage({ params }: LuckyDrawPageProps) {
	const { event_id } = use(params);
	const { user } = useAuth();

	// Only show create button if user is not a vendor
	const isVendor = user?.role === "vendor";
	useSetEventActions(isVendor ? null : <LuckyDrawPageButton />);

	const {
		data: sessions,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["lucky-draw-sessions", event_id],
		queryFn: () => getLuckyDrawSessions(event_id),
	});

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading lucky draw sessions..."
					description="Please wait while we fetch your lucky draw sessions..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load lucky draw sessions"
					description="We couldn't load lucky draw sessions. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<DataTable data={sessions || []} />
			)}
		</div>
	);
}
