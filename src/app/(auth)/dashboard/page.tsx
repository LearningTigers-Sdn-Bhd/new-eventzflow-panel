"use client";

import { useQueries } from "@tanstack/react-query";
import { ErrorState } from "@/components/data-state";
import { DashboardClientWrapper } from "@/components/pages/dashboard/dashboard-client-wrapper";
import { DashboardStats } from "@/components/pages/dashboard/dashboard-stats";
import { StatsSkeleton } from "@/components/pages/dashboard/stats-skeleton";
import { Button } from "@/components/ui/button";
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
		<div className="space-y-6 p-2">
			{/* Header */}
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
				<p className="text-muted-foreground">
					Monitor your events and track performance
				</p>
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
			<DashboardClientWrapper initialStats={stats} initialEvents={events} />
		</div>
	);
}
