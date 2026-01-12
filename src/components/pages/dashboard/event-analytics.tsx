"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
	Activity,
	ArrowLeft,
	Clock,
	DollarSign,
	MapPin,
	QrCode,
	Receipt,
	Scan,
	ScanFace,
	Search,
	ShoppingBag,
	Stamp,
	Ticket,
	TrendingUp,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { RiCalendarEventLine } from "react-icons/ri";
import {
	BlankCard,
	BlankCardWithButton,
	StatsCard,
	TimeSeriesChart,
} from "@/components/admin-ui/analytic";
import { IconHeading } from "@/components/admin-ui/icon-heading";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	getDateRangeFromPreset,
	getGroupByFromPreset,
	TimeRangeFilter,
	type TimeRangePreset,
} from "@/components/ui/time-range-filter";
import { useFormatDate } from "@/hooks/use-format-date";
import { useIsMobile } from "@/hooks/use-mobile";
import { getEventAnalytics } from "@/lib/api/dashboard";
import type { EventAnalytics as EventAnalyticsType } from "@/lib/api/dashboard/response";
import { getEventById } from "@/lib/api/event";
import { getMallLiveFeed } from "@/lib/api/event/analytics";
import { getVoucherAnalytics } from "@/lib/api/voucher-analytics";
import { cn } from "@/lib/utils";
import { useUserSessionStore } from "@/stores/new-auth-store";

interface EventAnalyticsProps {
	eventId: string;
	onBack: () => void;
	showBackButton?: boolean;
	initialData?: EventAnalyticsType;
}

export function EventAnalytics({
	eventId,
	onBack,
	showBackButton = true,
	initialData,
}: EventAnalyticsProps) {
	const router = useRouter();
	const { formatDate } = useFormatDate();
	const isMobile = useIsMobile();
	const [timeRange, setTimeRange] = useState<TimeRangePreset>("last_7_days");

	// Get date range and grouping based on selected preset
	const dateRange = getDateRangeFromPreset(timeRange);
	const groupBy = getGroupByFromPreset(timeRange);

	// Get user role to determine Live Feed visibility (must be before any early returns)
	const user = useUserSessionStore((state) => state.user);
	const canViewLiveFeed =
		user?.role === "org_owner" || user?.role === "organizer";

	// Fetch event details to determine event type
	const { data: eventDetails, isLoading: eventLoading } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	const isTicketEvent = eventDetails?.use_ticket !== false;

	// Fetch ticket analytics (for ticket events)
	const {
		data: analytics,
		isLoading: analyticsLoading,
		error: analyticsError,
	} = useQuery({
		queryKey: ["event-analytics", eventId, timeRange],
		queryFn: () =>
			getEventAnalytics(eventId, {
				startDate: dateRange?.startDate,
				endDate: dateRange?.endDate,
				groupBy,
			}),
		initialData,
		enabled: isTicketEvent,
	});

	// Fetch mall live feed (for non-ticket events)
	const {
		data: mallData,
		isLoading: mallLoading,
		error: mallError,
	} = useQuery({
		queryKey: ["event", eventId, "mall-live-feed"],
		queryFn: () => getMallLiveFeed({ id: Number.parseInt(eventId, 10) }),
		enabled: !isTicketEvent && !eventLoading,
	});

	// Fetch voucher analytics for visitor events (for recent redemptions)
	const { data: voucherAnalytics, isLoading: voucherLoading } = useQuery({
		queryKey: ["voucher-analytics", eventId],
		queryFn: () =>
			getVoucherAnalytics({
				event_id: Number.parseInt(eventId, 10),
			}),
		enabled: !isTicketEvent && !eventLoading,
	});

	const isLoading =
		eventLoading ||
		(isTicketEvent ? analyticsLoading : mallLoading || voucherLoading);
	const error = isTicketEvent ? analyticsError : mallError;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading analytics..."
				description="Please wait while we fetch event analytics."
			/>
		);
	}

	if (error || (isTicketEvent && !analytics)) {
		return (
			<ErrorState
				title="Failed to load analytics"
				description="We couldn't load event analytics. Please try again."
				action={
					<div className="flex gap-2">
						<Button variant="outline" onClick={onBack}>
							Go Back
						</Button>
						<Button onClick={() => window.location.reload()}>Retry</Button>
					</div>
				}
			/>
		);
	}

	const ticketAnalytics = analytics as EventAnalyticsType | undefined;
	const status = ticketAnalytics?.status || eventDetails?.status || "draft";
	const eventName = eventDetails?.title || "Event";
	const eventDescription = eventDetails?.description || "Event description";

	// Calculate rates
	const scanRate =
		ticketAnalytics && ticketAnalytics.totalTickets > 0
			? Math.round(
					(ticketAnalytics.scannedTickets / ticketAnalytics.totalTickets) * 100,
				)
			: 0;
	const redemptionRate = mallData?.redemption_rate ?? 0;

	const formatCurrency = (amount?: number) => {
		if (!amount) return "RM0.00";
		return new Intl.NumberFormat("ms-MY", {
			style: "currency",
			currency: "MYR",
		}).format(amount);
	};

	// Render content sections
	const renderKeyMetrics = () => (
		<div className="grid grid-cols-2 gap-2 border-y border-dashed lg:grid-cols-4">
			{isTicketEvent ? (
				<>
					<StatsCard
						label="Total Tickets"
						value={ticketAnalytics?.totalTickets ?? 0}
						Icon={Ticket}
					/>
					<StatsCard
						label="Scanned Tickets"
						value={ticketAnalytics?.scannedTickets ?? 0}
						Icon={QrCode}
					/>
					<StatsCard
						label="Unscanned Tickets"
						value={ticketAnalytics?.unscannedTickets ?? 0}
						Icon={Clock}
					/>
					<StatsCard
						label="Total Amount"
						value={ticketAnalytics?.totalRevenue.toLocaleString() ?? "0"}
						Icon={TrendingUp}
					/>
				</>
			) : (
				<>
					<StatsCard
						label="Shoppers Today"
						value={mallData?.shoppers_registered_today ?? 0}
						Icon={Users}
					/>
					<StatsCard
						label="Estimated Sales"
						value={formatCurrency(mallData?.estimated_sales_today)}
						Icon={DollarSign}
					/>
					<StatsCard
						label="Voucher Issuances"
						value={mallData?.voucher_issuances ?? 0}
						Icon={Ticket}
					/>
					<StatsCard
						label="Voucher Redemptions"
						value={mallData?.voucher_redemptions ?? 0}
						Icon={ShoppingBag}
					/>
				</>
			)}
		</div>
	);

	const renderTimeSeriesStats = () => {
		if (isTicketEvent) {
			return (
				<div className="mb-8 space-y-4 border-y border-dashed">
					<div className="flex items-center justify-between px-4 pt-4">
						<h3 className="font-medium text-sm">Analytics Trends</h3>
						<TimeRangeFilter value={timeRange} onChange={setTimeRange} />
					</div>
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
						<TimeSeriesChart
							title="Ticket Registrations"
							description="Ticket registrations over time"
							data={ticketAnalytics?.registrationData}
							isLoading={false}
							color="var(--chart-1)"
							icon={<Ticket className="h-4 w-4" />}
						/>
						<TimeSeriesChart
							title="Ticket Scans"
							description="Ticket scans over time"
							data={ticketAnalytics?.scanData}
							isLoading={false}
							color="var(--chart-2)"
							icon={<QrCode className="h-4 w-4" />}
						/>
						<TimeSeriesChart
							title="Revenue"
							description="Sales revenue over time"
							data={ticketAnalytics?.revenueData}
							isLoading={false}
							color="var(--chart-3)"
							icon={<DollarSign className="h-4 w-4" />}
						/>
					</div>
				</div>
			);
		}
		// Visitor events - placeholder/empty state
		// return (
		// 	<div className="mb-8 flex h-64 items-center justify-center border-y border-dashed">
		// 		<div className="text-center text-muted-foreground">
		// 			<Activity className="mx-auto mb-2 h-12 w-12 opacity-50" />
		// 			<p className="text-sm">
		// 				Analytics not available for visitor events
		// 			</p>
		// 		</div>
		// 	</div>
		// );
		return null;
	};

	const renderQuickInfo = () => {
		if (isTicketEvent) {
			return (
				<div className="h-full">
					<BlankCard
						title="Quick Info"
						icon={<Search className="size-4" />}
						className="h-full"
					>
						<div className="flex h-full flex-col justify-between">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-muted-foreground">
										<MapPin className="size-4" />
										<span className="text-sm">Locations</span>
									</div>
									<span className="font-semibold">
										{ticketAnalytics?.locations ?? 0}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Clock className="size-4" />
										<span className="text-sm">Pending Tickets</span>
									</div>
									<span className="font-semibold text-orange-600 dark:text-orange-400">
										{ticketAnalytics?.pendingTickets ?? 0}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Activity className="size-4" />
										<span className="text-sm">Scan Rate</span>
									</div>
									<span className="font-semibold">{scanRate}%</span>
								</div>
							</div>
							<div className="mt-4">
								<div className="mb-2 text-muted-foreground text-sm">
									Progress
								</div>
								<div className="h-2 overflow-hidden rounded-none border border-emerald-500/50 bg-secondary">
									<div
										className="h-full bg-linear-to-r from-green-500 to-emerald-500 transition-all"
										style={{ width: `${scanRate}%` }}
									/>
								</div>
							</div>
						</div>
					</BlankCard>
				</div>
			);
		}
		// Visitor events
		return (
			<div className="h-full">
				<BlankCard
					title="Engagement Overview"
					icon={<Search className="size-4" />}
					className="h-full"
				>
					<div className="flex h-full flex-col justify-between">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-muted-foreground">
									<TrendingUp className="size-4" />
									<span className="text-sm">Redemption Rate</span>
								</div>
								<span className="font-semibold">
									{redemptionRate.toFixed(1)}%
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-muted-foreground">
									<Stamp className="size-4" />
									<span className="text-sm">Total Vouchers</span>
								</div>
								<span className="font-semibold">
									{mallData?.voucher_issuances ?? 0}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-muted-foreground">
									<ShoppingBag className="size-4" />
									<span className="text-sm">Redeemed</span>
								</div>
								<span className="font-semibold text-green-600 dark:text-green-400">
									{mallData?.voucher_redemptions ?? 0}
								</span>
							</div>
						</div>
						<div className="mt-4">
							<div className="mb-2 text-muted-foreground text-sm">
								Redemption Progress
							</div>
							<div className="h-2 overflow-hidden rounded-none border border-blue-500/50 bg-secondary">
								<div
									className="h-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all"
									style={{ width: `${Math.min(redemptionRate, 100)}%` }}
								/>
							</div>
						</div>
					</div>
				</BlankCard>
			</div>
		);
	};

	const renderRecentScans = () => {
		if (isTicketEvent) {
			return (
				<div className="h-full">
					<BlankCardWithButton
						title="Recent Scans"
						icon={<ScanFace className="size-4" />}
						buttonLabel="View All Scan Logs"
						buttonIcon={<Scan className="h-4 w-4" />}
						onButtonClick={() =>
							router.push(
								`/event/${eventId}/scanned-logs` as Parameters<
									typeof router.push
								>[0],
							)
						}
					>
						<div className="h-[250px] ps-12">
							{ticketAnalytics?.recentScans &&
							ticketAnalytics.recentScans.length > 0 ? (
								<div className="h-full overflow-y-auto border-l border-dashed">
									{ticketAnalytics.recentScans.map((scan) => (
										<div
											key={scan.id}
											className="flex items-center justify-between border-b border-dashed p-3"
										>
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
													<Users className="h-5 w-5 text-primary" />
												</div>
												<div>
													<p className="font-medium text-sm">
														{scan.ticketHolder}
													</p>
													<p className="text-muted-foreground text-xs">
														{scan.email}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-medium text-sm">{scan.location}</p>
												<p className="text-muted-foreground text-xs">
													{formatDate(scan.timestamp)}
												</p>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="py-8 text-center text-muted-foreground">
									<Scan className="mx-auto mb-2 h-12 w-12 opacity-50" />
									<p className="text-sm">No scans yet</p>
								</div>
							)}
						</div>
					</BlankCardWithButton>
				</div>
			);
		}
		// Visitor events - show recent voucher redemptions
		const recentRedemptions =
			voucherAnalytics?.latestRedemptionTransactions?.slice(0, 10) || [];
		return (
			<div className="h-full">
				<BlankCardWithButton
					title="Recent Redemptions"
					icon={<Receipt className="size-4" />}
					buttonLabel="View All Redemptions"
					buttonIcon={<Receipt className="h-4 w-4" />}
					onButtonClick={() =>
						router.push(
							`/event/${eventId}/voucher-analytics` as Parameters<
								typeof router.push
							>[0],
						)
					}
				>
					<div className="h-[250px] ps-12">
						{recentRedemptions.length > 0 ? (
							<div className="h-full overflow-y-auto border-l border-dashed">
								{recentRedemptions.map((redemption) => (
									<div
										key={redemption.id}
										className="flex items-center justify-between border-b border-dashed p-3"
									>
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
												<Receipt className="h-5 w-5 text-primary" />
											</div>
											<div>
												<p className="font-medium text-sm">
													{redemption.voucher_title}
												</p>
												<p className="text-muted-foreground text-xs">
													{redemption.redeemer_name || "Unknown"}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-medium text-sm">
												{formatCurrency(
													Number.parseFloat(redemption.discount_applied_value),
												)}
											</p>
											<p className="text-muted-foreground text-xs">
												{formatDate(redemption.redemption_timestamp)}
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="py-8 text-center text-muted-foreground">
								<Receipt className="mx-auto mb-2 h-12 w-12 opacity-50" />
								<p className="text-sm">No redemptions yet</p>
							</div>
						)}
					</div>
				</BlankCardWithButton>
			</div>
		);
	};

	// Render header with conditional buttons
	const renderHeader = () => (
		<div className="flex w-full items-center justify-between p-4 px-0 md:px-4">
			<div className="flex w-full items-center gap-4">
				{showBackButton && (
					<Button variant="ghost" size="icon" onClick={onBack}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
				)}
				<div className="flex w-full flex-col gap-4 lg:flex-row">
					<div className="w-full">
						<IconHeading
							icon={RiCalendarEventLine}
							title={eventName}
							description={
								isTicketEvent ? eventDescription : "Track visitor engagement"
							}
							className="items-start"
						>
							<div className="mt-2 flex items-center gap-2">
								<Badge
									className={cn(
										"rounded-none py-1 capitalize md:py-0",
										status === "published" && "bg-green-500 text-white",
										status === "draft" && "bg-yellow-500 text-white",
										status === "cancelled" && "bg-red-500 text-white",
										status === "completed" && "bg-blue-500 text-white",
									)}
								>
									{status}
								</Badge>
								<Badge
									className={cn(
										"rounded-none py-1 capitalize md:py-0",
										isTicketEvent
											? "bg-purple-500 text-white"
											: "bg-cyan-500 text-white",
									)}
								>
									{isTicketEvent ? "Ticket Event" : "Visitor Event"}
								</Badge>
							</div>
						</IconHeading>
					</div>
					<div className="flex w-full flex-col items-center gap-2 lg:flex-row lg:justify-end">
						{isTicketEvent ? (
							<>
								<Button
									className="w-full rounded-none border py-6 md:py-4 lg:w-auto"
									variant="secondary"
									onClick={() => router.push("/scan")}
								>
									<QrCode className="mr-2 h-4 w-4" />
									Scan Tickets
								</Button>
								<Button
									className="w-full rounded-none border py-6 md:py-4 lg:w-auto"
									onClick={() =>
										router.push(
											`/event/${eventId}/tickets` as Parameters<
												typeof router.push
											>[0],
										)
									}
								>
									<Ticket className="mr-2 h-4 w-4" />
									View All Tickets
								</Button>
							</>
						) : (
							<>
								<Button
									className="w-full rounded-none border py-5 md:py-4 lg:w-auto"
									variant="secondary"
									onClick={() =>
										router.push(
											`/event/${eventId}/visitors` as Parameters<
												typeof router.push
											>[0],
										)
									}
								>
									<Users className="mr-2 h-4 w-4" />
									View Visitors
								</Button>
								{canViewLiveFeed && (
									<Button
										className="w-full rounded-none border py-5 md:py-4 lg:w-auto"
										onClick={() =>
											router.push(
												`/event/${eventId}/mall-live-feed` as Parameters<
													typeof router.push
												>[0],
											)
										}
									>
										<Activity className="mr-2 h-4 w-4" />
										Live Feed
									</Button>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);

	// Mobile: Show tabs, Desktop: Show single view
	if (isMobile) {
		return (
			<div className="space-y-6">
				{renderHeader()}

				{/* Analytics Tabs */}
				<Tabs defaultValue="key-metrics" className="rounded-none">
					<div className="relative w-full">
						{/* Left blur gradient */}
						<div className="pointer-events-none absolute top-0 -left-1 z-10 h-[90%] w-16 bg-linear-to-r from-foreground/20 via-muted/50 to-transparent opacity-30 blur-in-3xl" />
						{/* Right blur gradient */}
						<div className="pointer-events-none absolute top-0 -right-1 z-10 h-[90%] w-16 bg-linear-to-l from-foreground/20 via-muted/50 to-transparent opacity-30 blur-in-3xl" />
						<ScrollArea className="mx-auto w-full pb-2" scrollHideDelay={0}>
							<div className="w-full">
								<TabsList className="w-fit rounded-none border-2 px-1 py-6 *:px-8 *:py-5">
									<TabsTrigger value="key-metrics" className="rounded-none">
										Key Metrics
									</TabsTrigger>
									{isTicketEvent && (
										<TabsTrigger value="time-series-stats" className="rounded-none">
											Analytics
										</TabsTrigger>
									)}
									<TabsTrigger value="quick-info" className="rounded-none">
										Quick Info
									</TabsTrigger>
									<TabsTrigger value="recent-scans" className="rounded-none">
										Recent Scans
									</TabsTrigger>
								</TabsList>
							</div>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
					</div>

					<TabsContent value="key-metrics" className="mt-2">
						{renderKeyMetrics()}
					</TabsContent>

					{isTicketEvent && (
						<TabsContent value="time-series-stats" className="mt-2">
							{renderTimeSeriesStats()}
						</TabsContent>
					)}

					<TabsContent value="quick-info" className="mt-2">
						{renderQuickInfo()}
					</TabsContent>

					<TabsContent value="recent-scans" className="mt-2">
						{renderRecentScans()}
					</TabsContent>
				</Tabs>
			</div>
		);
	}

	// Desktop: Single view (no tabs)
	return (
		<div className="space-y-6">
			{renderHeader()}

			{/* Key Metrics */}
			<div>{renderKeyMetrics()}</div>

			{/* Analytics */}
			<div>{renderTimeSeriesStats()}</div>

			{/* Quick Info */}
			<div className="grid grid-cols-2 gap-2">
				<div className="col-span-1 h-full">{renderQuickInfo()}</div>
				{/* Recent Scans */}
				<div className="col-span-1 h-full">{renderRecentScans()}</div>
			</div>
		</div>
	);
}
