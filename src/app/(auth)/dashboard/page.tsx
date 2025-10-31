"use client";

import { useQueries } from "@tanstack/react-query";
import { MdSpaceDashboard } from "react-icons/md";
import { ErrorState } from "@/components/data-state";
import { DashboardClientWrapper } from "@/components/pages/dashboard/dashboard-client-wrapper";
import { DashboardStats } from "@/components/pages/dashboard/dashboard-stats";
import { StatsSkeleton } from "@/components/pages/dashboard/stats-skeleton";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useHydratedStore } from "@/hooks/use-hydrated-store";
import { getAllEventsStats, getEventsOverview } from "@/lib/api/dashboard";

export default function DashboardPage() {
	const isHydrated = useHydratedStore();

	const [
		{ data: stats, isLoading: statsLoading, error: statsError },
		{ data: events },
	] = useQueries({
		queries: [
			{
				queryKey: ["dashboard-stats"],
				queryFn: getAllEventsStats,
				enabled: isHydrated, // Only fetch when store is hydrated
			},
			{
				queryKey: ["events-overview"],
				queryFn: getEventsOverview,
				enabled: isHydrated, // Only fetch when store is hydrated
			},
		],
	});

	return (
		<div className="space-y-0">
			{/* Header */}
			<div className="flex flex-row items-center justify-start gap-1 border-b border-dashed px-2 py-4 md:px-4">
				<IconTitle
					icon={MdSpaceDashboard}
					title="Dashboard"
					description="Monitor your events and track performance"
				/>
			</div>

			{/* Overall Stats - Show skeleton while loading or error state */}
			{statsLoading ? (
				<StatsSkeleton />
			) : statsError ? (
				<ErrorState
					title="Failed to load statistics"
					description="We couldn't load your dashboard statistics. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : stats ? (
				<DashboardStats stats={stats} />
			) : null}

			{/* Interactive Dashboard Content */}
			<div className="mt-6 border-t border-dashed lg:mt-16">
				<DashboardClientWrapper initialStats={stats} initialEvents={events} />
			</div>
		</div>
	);
}
