"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import {
	Briefcase,
	Calendar,
	CalendarCheck,
	ChevronRight,
	Clock,
	MapPin,
	ShoppingBag,
	Speech,
	Ticket,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { MdSpaceDashboard } from "react-icons/md";
import { StatsCard } from "@/components/admin-ui/analytic";
import { ErrorState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTitle } from "@/components/ui/icon-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth/use-auth";
import { useFormatDate } from "@/hooks/use-format-date";
import {
	type BusinessMatchingEvent,
	getBusinessMatchingEvents,
} from "@/lib/api/business-matching";
import { getVendorDashboard } from "@/lib/api/vendor-dashboard";
import type { VendorEventData } from "@/lib/api/vendor-dashboard/response";
import { getEventStatusClass } from "@/lib/status-variants";
import { cn } from "@/lib/utils";

export function VendorDashboard() {
	const { isInitialized, user } = useAuth();
	const router = useRouter();
	const { formatDate } = useFormatDate();

	// Single optimized API call for all vendor dashboard data
	const {
		data: dashboardData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["vendor-dashboard"],
		queryFn: getVendorDashboard,
		enabled: isInitialized,
	});

	const { summary, events } = dashboardData || { summary: null, events: [] };

	// A vendor may also be a linked business matching host for one of these
	// same events — check each event for sessions they host. Empty for the
	// vast majority of vendors, in which case nothing renders below.
	const sessionQueries = useQueries({
		queries: events.map((event) => ({
			queryKey: ["business-matching-events", String(event.id)],
			queryFn: () => getBusinessMatchingEvents(String(event.id)),
			enabled: isInitialized && !!dashboardData,
		})),
	});

	if (!isInitialized || isLoading) {
		return <VendorDashboardSkeleton />;
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load dashboard"
				description="We couldn't load your dashboard data. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	// Keyed by event id — every hosted session's event is necessarily also in
	// `events` (sessionQueries is built from that same list), so this always
	// folds into the matching event card below rather than a separate section.
	const hostedSessionsByEventId = new Map<
		number,
		NonNullable<(typeof sessionQueries)[number]["data"]>
	>();
	events.forEach((event, i) => {
		const sessions = sessionQueries[i]?.data;
		if (sessions && sessions.length > 0) {
			hostedSessionsByEventId.set(event.id, sessions);
		}
	});

	return (
		<div className="space-y-0">
			{/* Header */}
			<div className="page-header border-b border-dashed">
				<div className="px-3 sm:px-4">
					<IconTitle
						icon={MdSpaceDashboard}
						title="Vendor Dashboard"
						description={`Welcome back, ${user?.full_name || "Vendor"}`}
					/>
				</div>
			</div>

			{/* Summary Stats - responsive grid */}
			{summary && (
				<div className="grid grid-cols-2 gap-1.5 p-2 sm:gap-2 sm:p-0 xl:grid-cols-4">
					<StatsCard
						label="Assigned Events"
						value={summary.total_events}
						subtitle={`${summary.active_events} active`}
						Icon={Calendar}
					/>
					<StatsCard
						label="Total Leads"
						value={summary.total_leads.toLocaleString()}
						Icon={Speech}
					/>
					<StatsCard
						label="Total Vouchers"
						value={summary.total_vouchers.toLocaleString()}
						Icon={Ticket}
					/>
					<StatsCard
						label="Vouchers Redeemed"
						value={summary.total_redeemed.toLocaleString()}
						Icon={ShoppingBag}
					/>
				</div>
			)}

			{/* Events List */}
			<div className="mt-4 border-t border-dashed pt-4 sm:mt-6 sm:pt-6">
				<div className="mb-3 px-3 sm:mb-4 sm:px-4">
					<IconTitle
						icon={Calendar}
						title="Your Events"
						description="Events you are assigned to as a vendor"
					/>
				</div>

				{events.length === 0 ? (
					<Card className="mx-3 rounded-none border-dashed sm:mx-4">
						<CardContent className="p-8 text-center sm:p-12">
							<Calendar className="mx-auto mb-4 h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
							<h3 className="mb-2 font-semibold text-base sm:text-lg">
								No events assigned
							</h3>
							<p className="text-muted-foreground text-sm">
								You haven't been assigned to any events yet.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-3 px-3 sm:gap-4 sm:px-4 lg:grid-cols-2">
						{events.map((event) => (
							<VendorEventCard
								key={event.id}
								event={event}
								formatDate={formatDate}
								hostedSessions={hostedSessionsByEventId.get(event.id)}
								onViewDetails={() =>
									router.push(`/event/${event.id}/vendor-profile` as Route)
								}
								onViewBusinessMatching={() =>
									router.push(`/event/${event.id}/business-matching` as Route)
								}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

// Vendor Event Card - displays pre-fetched analytics
interface VendorEventCardProps {
	event: VendorEventData;
	formatDate: (date: string) => string;
	// Present only if you're also a linked business matching host for this
	// same event — folded into this card instead of a separate section so
	// the event isn't shown twice.
	hostedSessions?: BusinessMatchingEvent[];
	onViewDetails: () => void;
	onViewBusinessMatching: () => void;
}

function VendorEventCard({
	event,
	formatDate,
	hostedSessions,
	onViewDetails,
	onViewBusinessMatching,
}: VendorEventCardProps) {
	const isTicketEvent = event.use_ticket !== false;

	return (
		<Card className="group rounded-none border-dashed p-0 transition-all hover:border-primary/30 hover:border-solid hover:shadow-md">
			<CardHeader className="space-y-3 p-3 sm:p-4">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="line-clamp-2 text-base sm:text-lg">
						{event.title}
					</CardTitle>
					<Button
						variant="default"
						size="sm"
						onClick={onViewDetails}
						className="shrink-0 gap-1 rounded-none text-xs transition-shadow group-hover:shadow-md sm:text-sm"
					>
						View
						<ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5" />
					</Button>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Badge
						className={cn(
							"shrink-0 rounded-none text-xs capitalize",
							getEventStatusClass(event.status),
						)}
					>
						{event.status}
					</Badge>
					<span className="text-muted-foreground text-xs">
						{formatDate(event.start_date)} - {formatDate(event.end_date)}
					</span>
				</div>
			</CardHeader>
			<CardContent className="border-t p-0">
				{/* Vendor Stats - optimized for mobile */}
				<div
					className={cn(
						"grid gap-2 p-3 sm:gap-3 sm:p-4",
						isTicketEvent ? "grid-cols-2" : "grid-cols-3",
					)}
				>
					{/* Lead count */}
					{!isTicketEvent && (
						<div className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2 text-center sm:flex-row sm:gap-2 sm:text-left">
							<Speech className="size-4 text-muted-foreground sm:size-5" />
							<div>
								<p className="text-[10px] text-muted-foreground sm:text-xs">
									Your Leads
								</p>
								<p className="font-bold text-base sm:text-lg">
									{event.lead_count}
								</p>
							</div>
						</div>
					)}

					{/* Voucher stats */}
					<div className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2 text-center sm:flex-row sm:gap-2 sm:text-left">
						<Ticket className="size-4 text-muted-foreground sm:size-5" />
						<div>
							<p className="text-[10px] text-muted-foreground sm:text-xs">
								Vouchers
							</p>
							<p className="font-bold text-base sm:text-lg">
								{event.total_vouchers}
							</p>
						</div>
					</div>

					<div className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2 text-center sm:flex-row sm:gap-2 sm:text-left">
						<ShoppingBag className="size-4 text-muted-foreground sm:size-5" />
						<div>
							<p className="text-[10px] text-muted-foreground sm:text-xs">
								Redeemed
							</p>
							<p className="font-bold text-base text-green-600 sm:text-lg dark:text-green-400">
								{event.total_redeemed}
							</p>
						</div>
					</div>
				</div>

				{/* Redemption Rate Progress Bar */}
				<div className="border-t p-3 sm:p-4">
					<div className="flex items-center justify-between text-xs">
						<span className="text-muted-foreground">Redemption Rate</span>
						<span className="font-medium font-mono">
							{event.redemption_rate.toFixed(1)}%
						</span>
					</div>
					<div className="mt-2 h-1.5 overflow-hidden rounded-none bg-secondary">
						<div
							className="h-full bg-linear-to-r from-green-500 to-emerald-500 transition-all"
							style={{ width: `${Math.min(event.redemption_rate, 100)}%` }}
						/>
					</div>
					<p className="mt-1 text-right text-muted-foreground text-xs">
						{event.total_redeemed} / {event.total_vouchers} vouchers
					</p>
				</div>

				{/* Business Matching — only if you also host sessions for this event */}
				{hostedSessions && hostedSessions.length > 0 && (
					<div className="border-t p-3 sm:p-4">
						<div className="mb-2 flex items-center justify-between gap-2">
							<span className="flex items-center gap-1.5 font-medium text-xs">
								<Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
								Business Matching — you host this
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={onViewBusinessMatching}
								className="h-7 shrink-0 gap-1 rounded-none text-xs"
							>
								View
								<ChevronRight className="h-3 w-3" />
							</Button>
						</div>
						<div className="space-y-1.5">
							{hostedSessions.map((session) => (
								<div
									key={session.id}
									className="flex items-center justify-between gap-2 rounded-none border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs"
								>
									<div className="min-w-0">
										<p className="truncate font-medium">{session.title}</p>
										<div className="flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground">
											{session.location && (
												<span className="flex items-center gap-1">
													<MapPin className="h-2.5 w-2.5 shrink-0" />
													{session.location}
												</span>
											)}
											<span className="flex items-center gap-1">
												<Clock className="h-2.5 w-2.5 shrink-0" />
												{session.duration} min sessions
											</span>
										</div>
									</div>
									<span className="flex shrink-0 items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
										<CalendarCheck className="h-3 w-3" />
										{session.bookings_count ?? 0}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function VendorDashboardSkeleton() {
	return (
		<div className="space-y-0">
			{/* Header */}
			<div className="page-header border-b border-dashed">
				<div className="px-3 sm:px-4">
					<Skeleton className="h-7 w-40 sm:h-8 sm:w-48" />
					<Skeleton className="mt-2 h-4 w-52 sm:w-64" />
				</div>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-2 gap-1.5 p-2 sm:gap-2 sm:p-0 xl:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="flex items-center justify-between rounded-none border border-dashed p-3 sm:p-4"
					>
						<div className="space-y-2">
							<Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
							<Skeleton className="h-6 w-12 sm:h-8 sm:w-16" />
							<Skeleton className="h-3 w-16 sm:w-20" />
						</div>
						<Skeleton className="h-8 w-8 shrink-0 rounded-md sm:h-10 sm:w-10" />
					</div>
				))}
			</div>

			{/* Events Section */}
			<div className="mt-4 border-t border-dashed pt-4 sm:mt-6 sm:pt-6">
				<div className="mb-3 px-3 sm:mb-4 sm:px-4">
					<Skeleton className="h-5 w-28 sm:h-6 sm:w-32" />
					<Skeleton className="mt-1 h-3 w-48 sm:w-56" />
				</div>
				<div className="grid gap-3 px-3 sm:gap-4 sm:px-4 lg:grid-cols-2">
					{[1, 2].map((i) => (
						<div key={i} className="rounded-none border border-dashed p-0">
							{/* Card Header */}
							<div className="space-y-3 p-3 sm:p-4">
								<div className="flex items-start justify-between gap-2">
									<Skeleton className="h-5 w-40 sm:h-6 sm:w-48" />
									<Skeleton className="h-8 w-16 shrink-0 rounded-none" />
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<Skeleton className="h-5 w-20 rounded-none" />
									<Skeleton className="h-3 w-32" />
								</div>
							</div>

							{/* Stats Grid */}
							<div className="grid grid-cols-2 gap-2 border-t p-3 sm:gap-3 sm:p-4">
								{[1, 2].map((j) => (
									<div
										key={j}
										className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2"
									>
										<Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
										<Skeleton className="h-2 w-12 sm:h-3" />
										<Skeleton className="h-5 w-10 sm:h-6 sm:w-12" />
									</div>
								))}
							</div>

							{/* Progress Bar */}
							<div className="border-t p-3 sm:p-4">
								<div className="flex items-center justify-between">
									<Skeleton className="h-3 w-24" />
									<Skeleton className="h-3 w-10" />
								</div>
								<Skeleton className="mt-2 h-1.5 w-full rounded-none" />
								<Skeleton className="mt-1 ml-auto h-3 w-28" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
