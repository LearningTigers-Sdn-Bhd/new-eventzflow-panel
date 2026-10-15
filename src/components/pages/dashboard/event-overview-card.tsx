"use client";

import {
	Calendar,
	ChevronRight,
	Clock,
	Scan,
	Ticket,
	TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/use-format-date";
import { getEventStatusClass } from "@/lib/status-variants";
import { cn } from "@/lib/utils";

export type EventOverview = {
	id: string;
	title: string;
	status: "draft" | "published" | "cancelled" | "completed";
	totalTickets: number;
	scannedTickets: number;
	totalRevenue: number;
	awaitingCheckingTickets: number;
	lastActivity?: string;
};

interface EventOverviewCardProps {
	event: EventOverview;
	onViewDetails: (eventId: string) => void;
}

export function EventOverviewCard({
	event,
	onViewDetails,
}: EventOverviewCardProps) {
	const { formatDate } = useFormatDate();
	const scanRate =
		event.totalTickets > 0
			? Math.round((event.scannedTickets / event.totalTickets) * 100)
			: 0;

	return (
		<Card className="group transition-all hover:shadow-md">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<h3 className="mb-2 font-semibold text-lg leading-none">
							{event.title}
						</h3>
						<Badge
							className={cn(
								"text-xs capitalize",
								getEventStatusClass(event.status),
							)}
						>
							{event.status}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1">
						<div className="flex items-center gap-2 text-muted-foreground text-xs">
							<Ticket className="h-3.5 w-3.5" />
							<span>Total Tickets</span>
						</div>
						<p className="font-bold text-2xl">{event.totalTickets}</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center gap-2 text-muted-foreground text-xs">
							<Scan className="h-3.5 w-3.5" />
							<span>Scanned</span>
						</div>
						<p className="font-bold text-2xl text-green-600 dark:text-green-400">
							{event.scannedTickets}
						</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center gap-2 text-muted-foreground text-xs">
							<TrendingUp className="h-3.5 w-3.5" />
							<span>Revenue</span>
						</div>
						<p className="font-bold text-xl">
							RM{event.totalRevenue.toLocaleString()}
						</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center gap-2 text-muted-foreground text-xs">
							<Clock className="h-3.5 w-3.5" />
							<span>Awaiting Check-In</span>
						</div>
						<p className="font-bold text-orange-600 text-xl dark:text-orange-400">
							{event.awaitingCheckingTickets}
						</p>
					</div>
				</div>

				{/* Scan Rate Progress */}
				<div className="space-y-2">
					<div className="flex items-center justify-between text-xs">
						<span className="text-muted-foreground">Scan Rate</span>
						<span className="font-semibold">{scanRate}%</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-secondary">
						<div
							className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
							style={{ width: `${scanRate}%` }}
						/>
					</div>
				</div>

				{/* Last Activity */}
				{event.lastActivity && (
					<div className="flex items-center gap-2 pt-1 text-muted-foreground text-xs">
						<Calendar className="h-3.5 w-3.5" />
						<span>Last activity: {formatDate(event.lastActivity)}</span>
					</div>
				)}

				{/* View Details Button */}
				<Button
					variant="outline"
					className="w-full transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
					onClick={() => onViewDetails(event.id)}
				>
					View Dashboard
					<ChevronRight className="ml-2 h-4 w-4" />
				</Button>
			</CardContent>
		</Card>
	);
}
