"use client";

import {
	Calendar,
	ChevronRight,
	Clock,
	ScanFace,
	Stamp,
	Tickets,
	TrendingUp,
	Users,
} from "lucide-react";
import type { ReactElement } from "react";
import { CompactStatsCard } from "@/components/admin-ui/analytic";
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
	error?: unknown;
}

function EventCardHeader({
	event,
	onEventSelect,
	formatDate,
}: {
	event: EventOverview;
	onEventSelect: (eventId: string) => void;
	formatDate: (date: string | Date) => string;
}): ReactElement {
	return (
		<CardHeader className="space-y-2 px-4 pt-4">
			<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between md:gap-2">
				<div className="flex flex-col items-start gap-2">
					<CardTitle className="line-clamp-2 text-balance font-bold text-base tracking-tight">
						{event.title}
					</CardTitle>
					<span className="text-muted-foreground text-xs">
						Last activity: {formatDate(event.lastActivity)}
					</span>
					<div className="flex flex-row items-center gap-1.5">
						<Badge
							className={cn(
								"min-w-24 shrink-0 rounded-none py-0.5 capitalize md:py-1",
								event.status === "published" && "bg-green-500 text-white",
								event.status === "draft" && "bg-yellow-500 text-white",
								event.status === "cancelled" && "bg-red-500 text-white",
								event.status === "completed" && "bg-blue-500 text-white",
							)}
						>
							{event.status}
						</Badge>
						<Badge
							className={cn(
								"min-w-24 shrink-0 rounded-none py-0.5 capitalize md:py-1",
								event.useTicket
									? "bg-purple-500 text-white"
									: "bg-cyan-500 text-white",
							)}
						>
							{event.useTicket ? "Ticket Event" : "Visitor Event"}
						</Badge>
					</div>
				</div>
				<Button
					variant="default"
					size="sm"
					onClick={() => onEventSelect(event.id)}
					className="w-full shrink-0 gap-1 rounded-none py-6 transition-shadow group-hover:shadow-md sm:w-auto md:py-0"
				>
					Details
					<ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
				</Button>
			</div>
		</CardHeader>
	);
}

function TicketEventCard({
	event,
	onEventSelect,
	formatDate,
}: {
	event: EventOverview;
	onEventSelect: (eventId: string) => void;
	formatDate: (date: string | Date) => string;
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
			<EventCardHeader
				event={event}
				onEventSelect={onEventSelect}
				formatDate={formatDate}
			/>
			<CardContent className="p-0">
				{/* Stats Grid */}
				<div className="grid grid-cols-3 gap-2 px-3 pb-3">
					<CompactStatsCard
						icon={Tickets}
						label="Total"
						count={event.totalTickets}
						variant="sky"
					/>
					<CompactStatsCard
						icon={ScanFace}
						label="Scanned"
						count={event.scannedTickets}
						variant="emerald"
					/>
					<CompactStatsCard
						icon={Clock}
						label="Pending"
						count={event.pendingTickets}
						variant="yellow"
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
	formatDate: (date: string | Date) => string;
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
			<EventCardHeader
				event={event}
				onEventSelect={onEventSelect}
				formatDate={formatDate}
			/>
			<CardContent className="p-0">
				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-2 px-3 pb-3">
					<CompactStatsCard
						icon={Users}
						label="Visitors"
						count={event.totalVisitors}
					/>
					<CompactStatsCard
						icon={Stamp}
						label="Stamps"
						count={event.totalStamps}
						variant="sky"
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
	formatDate: (date: string | Date) => string;
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
