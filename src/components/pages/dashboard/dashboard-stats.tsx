import {
	Activity,
	Calendar,
	type LucideIcon,
	Scan,
	Ticket,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AllEventsStats } from "@/lib/api/dashboard/response";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
	stats: AllEventsStats;
}

interface StatCardProps {
	title: string;
	value: string | number;
	subtitle: string;
	icon: LucideIcon;
}

function StatCard({ title, value, subtitle, icon: Icon }: StatCardProps) {
	return (
		<Card
			className={cn(
				"rounded-none border border-border/90 border-x border-dashed bg-muted/50 p-0 shadow-none lg:border-l",
			)}
		>
			<CardContent className="h-full p-0">
				<div className="flex h-full flex-col items-center justify-between gap-2 md:flex-row md:gap-0">
					<div className="flex h-full items-center justify-center px-6 pt-3 md:py-0">
						<Icon className={cn("size-8 md:size-6")} />
					</div>
					<div className="flex h-full w-full flex-col justify-center px-4 pb-6 text-center md:px-0 md:py-4 md:text-left">
						<p className={cn("text-balance align-top font-semibold text-sm")}>
							{title}
						</p>
						<p className="font-bold text-xl tracking-tight">{value}</p>
						<p className="text-muted-foreground text-sm">{subtitle}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function DashboardStats({ stats }: DashboardStatsProps) {
	const avgLocationsPerEvent =
		stats.totalEvents > 0
			? (stats.totalLocations / stats.totalEvents).toFixed(1)
			: 0;

	return (
		<div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
			<StatCard
				title="Total Events"
				value={stats.totalEvents}
				subtitle={`${stats.activeEvents} active`}
				icon={Calendar}
			/>
			<StatCard
				title="Total Tickets"
				value={stats.totalTickets.toLocaleString()}
				subtitle="Across all events"
				icon={Ticket}
			/>
			<StatCard
				title="Total Check-Ins"
				value={stats.totalCheckins.toLocaleString()}
				subtitle="Across all events"
				icon={Scan}
			/>
			<StatCard
				title="Total Locations"
				value={stats.totalLocations}
				subtitle={`Avg ${avgLocationsPerEvent} per event`}
				icon={Activity}
			/>
		</div>
	);
}
