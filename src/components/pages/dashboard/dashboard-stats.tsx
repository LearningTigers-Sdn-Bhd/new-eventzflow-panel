import {
	Activity,
	Calendar,
	Scan,
	ShoppingBag,
	Store,
	Ticket,
	Users,
} from "lucide-react";
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

	const hasTicketEvents = stats.ticketEvents > 0;
	const hasNonTicketEvents = stats.nonTicketEvents > 0;

	return (
		<div className="space-y-4">
			{/* General Stats */}
			<div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
				<StatsCard
					label="Total Events"
					value={stats.totalEvents}
					subtitle={`${stats.activeEvents} active`}
					Icon={Calendar}
				/>
				<StatsCard
					label="Total Locations"
					value={stats.totalLocations}
					subtitle={`Avg ${avgLocationsPerEvent} per event`}
					Icon={Activity}
				/>
				{hasTicketEvents && (
					<>
						<StatsCard
							label="Total Tickets"
							value={stats.totalTickets.toLocaleString()}
							subtitle={`${stats.ticketEvents} ticket event${stats.ticketEvents > 1 ? "s" : ""}`}
							Icon={Ticket}
						/>
						<StatsCard
							label="Total Check-Ins"
							value={stats.totalCheckins.toLocaleString()}
							subtitle="Across ticket events"
							Icon={Scan}
						/>
					</>
				)}
				{hasNonTicketEvents && (
					<StatsCard
						label="Total Visitors"
						value={stats.totalVisitors.toLocaleString()}
						subtitle={`${stats.nonTicketEvents} non-ticket event${stats.nonTicketEvents > 1 ? "s" : ""}`}
						Icon={Users}
					/>
				)}
				<StatsCard
					label="Total Vendors"
					value={stats.totalVendors.toLocaleString()}
					subtitle="Across all events"
					Icon={Store}
				/>
				<StatsCard
					label="Total Vouchers"
					value={stats.totalVouchers.toLocaleString()}
					subtitle="Across all events"
					Icon={Ticket}
				/>
				<StatsCard
					label="Vouchers Redeemed"
					value={stats.totalVouchersRedeemed.toLocaleString()}
					subtitle="Across all events"
					Icon={ShoppingBag}
				/>
			</div>
		</div>
	);
}
