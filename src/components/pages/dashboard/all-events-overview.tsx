"use client";

import {
	Calendar,
	ChevronRight,
	Clock,
	type LucideIcon,
	ScanFace,
	Tickets,
	TrendingUp,
} from "lucide-react";
import type { ReactElement } from "react";
import type { IconType } from "react-icons";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/use-format-date";
import { cn } from "@/lib/utils";

interface AllEventsOverviewProps {
	onEventSelect: (eventId: string) => void;
	events?: any[];
	isLoading?: boolean;
	error?: any;
}

interface EventCardProps {
	icon: LucideIcon | IconType;
	label: string;
	count: number;
	countClassName?: string;
}

function StatCard({
	icon: Icon,
	label,
	count,
	countClassName,
}: EventCardProps): ReactElement {
	return (
		<div className="flex items-center justify-between gap-1.5 border border-primary/20 bg-primary/5 p-2">
			<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
				<Icon className="size-6" />
			</div>
			<div className="ml-2 flex w-full flex-col items-start text-left">
				<p className="font-semibold text-sm">{label}</p>
				<p className={cn("font-bold text-xl", countClassName)}>{count}</p>
			</div>
		</div>
	);
}

function EventOverviewCard({
	event,
	onEventSelect,
	formatDate,
}: {
	event: any;
	onEventSelect: (eventId: string) => void;
	formatDate: (date: any) => string;
}): ReactElement {
	const scanRate =
		event.totalTickets > 0
			? Math.round((event.scannedTickets / event.totalTickets) * 100)
			: 0;

	return (
		<Card
			key={event.id}
			className="group rounded-none border-dashed p-0 transition-all hover:border-primary/30 hover:border-solid hover:shadow-md"
		>
			<CardHeader className="space-y-2 p-4">
				<div className="grid grid-cols-4 items-center gap-3 md:gap-2">
					<CardTitle className="col-span-3 line-clamp-2 truncate text-balance">
						{event.title}
					</CardTitle>
					<Button
						variant="default"
						size="sm"
						onClick={() => onEventSelect(event.id)}
						className="shrink-0 gap-1 rounded-none transition-shadow group-hover:shadow-md"
					>
						Details
						<ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
					</Button>
				</div>
				<div className="flex items-center gap-2">
					<Badge
						className={cn(
							"shrink-0 rounded-none",
							event.status === "active"
								? "bg-green-500 text-white"
								: "bg-red-500 text-white",
						)}
					>
						{event.status === "active" ? "Active" : "Inactive"}
					</Badge>
					<span className="text-muted-foreground text-xs">
						Last activity: {formatDate(event.lastActivity)}
					</span>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				{/* Stats Grid */}
				<div className="grid grid-cols-3 gap-3 px-4 pb-3">
					{/* Total Tickets */}
					<StatCard icon={Tickets} label="Total" count={event.totalTickets} />

					{/* Scanned */}
					<StatCard
						icon={ScanFace}
						label="Scanned"
						count={event.scannedTickets}
						countClassName="text-green-500 dark:text-green-400"
					/>

					{/* Pending */}
					<StatCard
						icon={Clock}
						label="Pending"
						count={event.pendingTickets}
						countClassName="text-yellow-600 dark:text-yellow-400"
					/>
				</div>

				{/* Revenue & Progress */}
				<div className="flex items-center border-t">
					<div className="space-y-1 border-r border-dashed p-4">
						<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
							<TrendingUp className="h-3 w-3" />
							<span>Revenue</span>
						</div>
						<p className="font-bold text-lg">
							${event.totalRevenue.toLocaleString()}
						</p>
					</div>

					<div className="flex-1 space-y-1 p-4">
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">Progress</span>
							<span className="font-medium font-mono">{scanRate}%</span>
						</div>
						<div className="h-1.5 overflow-hidden rounded-none bg-secondary">
							<div
								className="h-full bg-linear-to-r from-green-500 to-emerald-500 transition-all"
								style={{ width: `${scanRate}%` }}
							/>
						</div>
						<p className="text-right text-muted-foreground text-xs">
							{event.scannedTickets} / {event.totalTickets}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function AllEventsOverview({
	onEventSelect,
	events,
	isLoading,
	error,
}: AllEventsOverviewProps): ReactElement {
	const { formatDate } = useFormatDate();

	if (isLoading) {
		return (
			<LoadingState
				title="Loading events..."
				description="Please wait while we fetch all events data."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load events"
				description="We couldn't load events data. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	if (!events || events.length === 0) {
		return (
			<Card>
				<CardContent className="p-12 text-center">
					<Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-lg">No events yet</h3>
					<p className="mb-4 text-muted-foreground">
						Create your first event to get started.
					</p>
					<Button>Create Event</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{/* Helper Info */}
			{events.length > 1 && (
				<Banner
					leadingIcon={<Calendar className="size-4 text-primary" />}
					title={`You have ${events.length} events`}
					description={
						'Click "View Details" on any event to see detailed analytics'
					}
					onCloser={true}
				/>
			)}

			<div className="grid gap-4 lg:grid-cols-2">
				{events.map((event) => (
					<EventOverviewCard
						key={event.id}
						event={event}
						onEventSelect={onEventSelect}
						formatDate={formatDate}
					/>
				))}
			</div>
		</div>
	);
}
