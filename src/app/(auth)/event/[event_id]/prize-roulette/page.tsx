"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { DataTable } from "@/components/pages/surprise-mechanics/roulette/draw-session-table";
import { RoulettePageButton } from "@/components/pages/surprise-mechanics/roulette/manage-session/index-create-button";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getRouletteSessions } from "@/lib/api/roulette";

interface PrizeRoulettePageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function PrizeRoulettePage({ params }: PrizeRoulettePageProps) {
	const { event_id } = use(params);
	const { user } = useAuth();
	const { currentEvent } = useEventSidebarContext();

	// "vendor" role covers both Exhibitor and Merchant event-vendor types
	// (see EventVendorService.determine_vendor_type on the backend) — only
	// hide the create button for plain Merchants, not Exhibitors.
	const isMerchantOnly =
		user?.role === "vendor" &&
		!(currentEvent?.use_ticket || currentEvent?.use_exhibitor_kit);
	useSetEventActions(isMerchantOnly ? null : <RoulettePageButton />);

	const {
		data: sessions,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["roulette-sessions", event_id],
		queryFn: () => getRouletteSessions(event_id),
	});

	return (
		<div className="space-y-4">
			{isLoading ? (
				<LoadingState
					title="Loading prize roulette sessions..."
					description="Please wait while we fetch your prize roulette sessions..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load prize roulette sessions"
					description="We couldn't load prize roulette sessions. Please try again."
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
