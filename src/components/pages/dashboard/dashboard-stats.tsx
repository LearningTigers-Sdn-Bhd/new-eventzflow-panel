import { Activity, Calendar, Scan, Ticket } from "lucide-react";
import { StatsCard } from "@/components/analytics-card";
import type { AllEventsStats } from "@/lib/api/dashboard/response";

interface DashboardStatsProps {
	stats: AllEventsStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
	const avgLocationsPerEvent =
		stats.totalEvents > 0
			? (stats.totalLocations / stats.totalEvents).toFixed(1)
			: 0;

	return (
		<div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
			<StatsCard
				label="Total Events"
				value={stats.totalEvents}
				subtitle={`${stats.activeEvents} active`}
				Icon={Calendar}
			/>
			<StatsCard
				label="Total Tickets"
				value={stats.totalTickets.toLocaleString()}
				subtitle="Across all events"
				Icon={Ticket}
			/>
			<StatsCard
				label="Total Check-Ins"
				value={stats.totalCheckins.toLocaleString()}
				subtitle="Across all events"
				Icon={Scan}
			/>
			<StatsCard
				label="Total Locations"
				value={stats.totalLocations}
				subtitle={`Avg ${avgLocationsPerEvent} per event`}
				Icon={Activity}
			/>
		</div>
	);
}
