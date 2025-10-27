import { Activity, Calendar, Scan, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AllEventsStats } from "@/lib/api/dashboard/response";

interface DashboardStatsProps {
	stats: AllEventsStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
	return (
		<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div className="flex-1 min-w-0">
							<p className="text-muted-foreground text-base font-medium">
								Total Events
							</p>
							<p className="font-bold text-xl mt-1">{stats.totalEvents}</p>
							<p className="text-muted-foreground text-xs mt-0.5">
								{stats.activeEvents} active
							</p>
						</div>
						<div className="p-2 rounded-md border border-blue-500/30 bg-blue-500/10 flex items-center justify-center shrink-0">
							<Calendar className="h-5 w-5 text-blue-500" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div className="flex-1 min-w-0">
							<p className="text-muted-foreground text-base font-medium">
								Total Tickets
							</p>
							<p className="font-bold text-xl mt-1">
								{stats.totalTickets.toLocaleString()}
							</p>
							<p className="text-muted-foreground text-xs mt-0.5">
								Across all events
							</p>
						</div>
						<div className="p-2 rounded-md border border-purple-500/30 bg-purple-500/10 flex items-center justify-center shrink-0">
							<Ticket className="h-5 w-5 text-purple-500" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div className="flex-1 min-w-0">
							<p className="text-muted-foreground text-base font-medium">
								Total Check-Ins
							</p>
							<p className="font-bold text-xl mt-1">
								{stats.totalCheckins.toLocaleString()}
							</p>
							<p className="text-muted-foreground text-xs mt-0.5">
								Across all events
							</p>
						</div>
						<div className="p-2 rounded-md border border-green-500/30 bg-green-500/10 flex items-center justify-center shrink-0">
							<Scan className="h-5 w-5 text-green-500" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div className="flex-1 min-w-0">
							<p className="text-muted-foreground text-base font-medium">
								Total Locations
							</p>
							<p className="font-bold text-xl mt-1">{stats.totalLocations}</p>
							<p className="text-muted-foreground text-xs mt-0.5">
								Avg{" "}
								{stats.totalEvents > 0
									? (stats.totalLocations / stats.totalEvents).toFixed(1)
									: 0}{" "}
								per event
							</p>
						</div>
						<div className="p-2 rounded-md border border-orange-500/30 bg-orange-500/10 flex items-center justify-center shrink-0">
							<Activity className="h-5 w-5 text-orange-500" />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
