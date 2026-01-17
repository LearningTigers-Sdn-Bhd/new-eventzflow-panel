"use client";

import { useQueries } from "@tanstack/react-query";
import { MdSpaceDashboard } from "react-icons/md";
import { IconTitle } from "@/components/admin-ui/icon-heading";
import { ErrorState } from "@/components/data-state";
import { ContractorDashboard } from "@/components/pages/dashboard/contractor-dashboard";
import { DashboardClientWrapper } from "@/components/pages/dashboard/dashboard-client-wrapper";
import { DashboardStats } from "@/components/pages/dashboard/dashboard-stats";
import { StatsSkeleton } from "@/components/pages/dashboard/stats-skeleton";
import { VendorDashboard } from "@/components/pages/dashboard/vendor-dashboard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useIsTablet } from "@/hooks/use-tablet";
import { getAllEventsStats, getEventsOverview } from "@/lib/api/dashboard";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
	const { user, isInitialized } = useAuth();
	const isTablet = useIsTablet();
	const [
		{ data: stats, isLoading: statsLoading, error: statsError },
		{ data: events },
	] = useQueries({
		queries: [
			{
				queryKey: ["dashboard-stats"],
				queryFn: getAllEventsStats,
				enabled: isInitialized, // Only fetch when store is hydrated
			},
			{
				queryKey: ["events-overview"],
				queryFn: getEventsOverview,
				enabled: isInitialized, // Only fetch when store is hydrated
			},
		],
	});

	// Show vendor dashboard for vendor role
	if (user?.role === "vendor") {
		return <VendorDashboard />;
	}

	// Show contractor dashboard for exhibition_contractor role
	if (user?.role === "exhibition_contractor") {
		return <ContractorDashboard />;
	}

	return (
		<div className="space-y-0">
			{/* Header */}
			<div
				className={cn("page-header", !isTablet ? "border-b border-dashed" : "")}
			>
				<div className="w-full px-0 lg:px-4">
					<IconTitle
						icon={MdSpaceDashboard}
						title="Dashboard"
						description="Monitor your events and track performance"
					/>
				</div>
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
			<div className={cn("mt-6", !isTablet ? "border-t border-dashed" : "")}>
				<DashboardClientWrapper initialStats={stats} initialEvents={events} />
			</div>
		</div>
	);
}
