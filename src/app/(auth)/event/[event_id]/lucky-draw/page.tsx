"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { DataTable } from "@/components/pages/surprise-mechanics/lucky-draw/draw-session-table";
import { LuckyDrawPageButton } from "@/components/pages/surprise-mechanics/lucky-draw/manage-session/index-create-button";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
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
	const { currentEvent } = useEventSidebarContext();

	// "vendor" role covers both Exhibitor and Merchant event-vendor types
	// (see EventVendorService.determine_vendor_type on the backend) — only
	// hide the create button for plain Merchants, not Exhibitors.
	const isMerchantOnly =
		user?.role === "vendor" &&
		!(currentEvent?.use_ticket || currentEvent?.use_exhibitor_kit);
	useSetEventActions(isMerchantOnly ? null : <LuckyDrawPageButton />);

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
