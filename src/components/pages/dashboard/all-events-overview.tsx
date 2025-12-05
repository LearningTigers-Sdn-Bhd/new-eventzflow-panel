"use client";

import {
	Calendar,
	ChevronRight,
	Clock,
	type LucideIcon,
	ScanFace,
	Stamp,
	Tickets,
	TrendingUp,
	Users,
} from "lucide-react";
import type { ReactElement } from "react";
import type { IconType } from "react-icons";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/use-format-date";
import type { EventOverview } from "@/lib/api/dashboard/response";
import { cn } from "@/lib/utils";

interface AllEventsOverviewProps {
	onEventSelect: (eventId: string) => void;
	events?: EventOverview[];
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
		<div className="flex min-w-0 flex-col items-center gap-1 border border-primary/20 bg-primary/5 p-2 text-center">
			<Icon className="size-5 text-muted-foreground" />
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className={cn("font-bold text-lg", countClassName)}>{count}</p>
		</div>
	);
}

function TicketEventCard({
	event,
	onEventSelect,
	formatDate,
}: {
	event: EventOverview;
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
				<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
					<CardTitle className="line-clamp-2 text-balance">
						{event.title}
					</CardTitle>
					<Button
						variant="default"
						size="sm"
						onClick={() => onEventSelect(event.id)}
						className="w-full shrink-0 gap-1 rounded-none transition-shadow group-hover:shadow-md sm:w-auto"
					>
						Details
						<ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
					</Button>
				</div>
				<div className="flex items-center gap-2">
					<Badge
						className={cn(
							"shrink-0 rounded-none capitalize",
							event.status === "published" && "bg-green-500 text-white",
							event.status === "draft" && "bg-yellow-500 text-white",
							event.status === "cancelled" && "bg-red-500 text-white",
							event.status === "completed" && "bg-blue-500 text-white",
						)}
					>
						{event.status}
					</Badge>
					<span className="text-muted-foreground text-xs">
						Last activity: {formatDate(event.lastActivity)}
					</span>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				{/* Stats Grid */}
				<div className="grid grid-cols-3 gap-2 px-3 pb-3">
					<StatCard icon={Tickets} label="Total" count={event.totalTickets} />
					<StatCard
						icon={ScanFace}
						label="Scanned"
						count={event.scannedTickets}
						countClassName="text-green-500 dark:text-green-400"
					/>
					<StatCard
						icon={Clock}
						label="Pending"
						count={event.pendingTickets}
						countClassName="text-yellow-600 dark:text-yellow-400"
					/>
				</div>

				{/* Revenue & Progress */}
				<div className="flex items-center border-t">
					<div className="shrink-0 space-y-1 border-r border-dashed p-3 md:p-4">
						<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
							<TrendingUp className="h-3 w-3" />
							<span>Revenue</span>
						</div>
						<p className="font-bold text-base md:text-lg">
							RM{event.totalRevenue.toLocaleString()}
						</p>
					</div>

					<div className="min-w-0 flex-1 space-y-1 p-3 md:p-4">
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

function VisitorEventCard({
	event,
	onEventSelect,
	formatDate,
}: {
	event: EventOverview;
	onEventSelect: (eventId: string) => void;
	formatDate: (date: any) => string;
}): ReactElement {
	const engagementRate =
		event.totalVisitors > 0
			? Math.round((event.totalStamps / event.totalVisitors) * 100)
			: 0;

	return (
		<Card
			key={event.id}
			className="group rounded-none border-dashed p-0 transition-all hover:border-primary/30 hover:border-solid hover:shadow-md"
		>
			<CardHeader className="space-y-2 p-4">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
					<CardTitle className="line-clamp-2 text-balance">
						{event.title}
					</CardTitle>
					<Button
						variant="default"
						size="sm"
						onClick={() => onEventSelect(event.id)}
						className="w-full shrink-0 gap-1 rounded-none transition-shadow group-hover:shadow-md sm:w-auto"
					>
						Details
						<ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
					</Button>
				</div>
				<div className="flex items-center gap-2">
					<Badge
						className={cn(
							"shrink-0 rounded-none capitalize",
							event.status === "published" && "bg-green-500 text-white",
							event.status === "draft" && "bg-yellow-500 text-white",
							event.status === "cancelled" && "bg-red-500 text-white",
							event.status === "completed" && "bg-blue-500 text-white",
						)}
					>
						{event.status}
					</Badge>
					<span className="text-muted-foreground text-xs">
						Last activity: {formatDate(event.lastActivity)}
					</span>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-2 px-3 pb-3">
					<StatCard icon={Users} label="Visitors" count={event.totalVisitors} />
					<StatCard
						icon={Stamp}
						label="Stamps"
						count={event.totalStamps}
						countClassName="text-blue-500 dark:text-blue-400"
					/>
				</div>

				{/* Engagement Progress */}
				<div className="border-t p-3 md:p-4">
					<div className="flex items-center justify-between text-xs">
						<span className="text-muted-foreground">Engagement Rate</span>
						<span className="font-medium font-mono">{engagementRate}%</span>
					</div>
					<div className="mt-2 h-1.5 overflow-hidden rounded-none bg-secondary">
						<div
							className="h-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all"
							style={{ width: `${Math.min(engagementRate, 100)}%` }}
						/>
					</div>
					<p className="mt-1 text-right text-muted-foreground text-xs">
						{event.totalStamps} stamps / {event.totalVisitors} visitors
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

function EventOverviewCard({
	event,
	onEventSelect,
	formatDate,
}: {
	event: EventOverview;
	onEventSelect: (eventId: string) => void;
	formatDate: (date: any) => string;
}): ReactElement {
	if (event.useTicket) {
		return (
			<TicketEventCard
				event={event}
				onEventSelect={onEventSelect}
				formatDate={formatDate}
			/>
		);
	}

	return (
		<VisitorEventCard
			event={event}
			onEventSelect={onEventSelect}
			formatDate={formatDate}
		/>
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
