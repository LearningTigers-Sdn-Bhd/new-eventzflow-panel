"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Activity,
	ArrowLeft,
	Clock,
	DollarSign,
	MapPin,
	QrCode,
	Scan,
	ScanFace,
	Search,
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
	WeeklyChart,
} from "@/components/analytics-card";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useFormatDate } from "@/hooks/use-format-date";
import { getEventAnalytics } from "@/lib/api/dashboard";
import type { EventAnalytics as EventAnalyticsType } from "@/lib/api/dashboard/response";

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
	const {
		data: analytics,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event-analytics", eventId],
		queryFn: () => getEventAnalytics(eventId),
		initialData,
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading analytics..."
				description="Please wait while we fetch event analytics."
			/>
		);
	}

	if (error || !analytics) {
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

	const scanRate =
		analytics.totalTickets > 0
			? Math.round((analytics.scannedTickets / analytics.totalTickets) * 100)
			: 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex w-full items-center justify-between p-4 px-2 md:px-4">
				<div className="flex w-full items-center gap-4">
					{showBackButton && (
						<Button variant="ghost" size="icon" onClick={onBack}>
							<ArrowLeft className="h-5 w-5" />
						</Button>
					)}
					<div className="flex w-full flex-col gap-4 lg:flex-row">
						<div className="w-full">
							<IconTitle
								icon={RiCalendarEventLine}
								title={analytics.eventName}
								description="Track your event efficiently"
							/>
							<Badge
								className="mt-2 ml-12 rounded-none"
								variant={
									analytics.status === "active" ? "default" : "destructive"
								}
							>
								{analytics.status === "active" ? "Active" : "Inactive"}
							</Badge>
						</div>
						<div className="flex w-full flex-col items-center gap-2 lg:flex-row lg:justify-end">
							<Button
								className="w-full rounded-none border py-5 md:py-4 lg:w-auto"
								variant="secondary"
								onClick={() => router.push("/scan")}
							>
								<QrCode className="mr-2 h-4 w-4" />
								Scan Tickets
							</Button>
							<Button
								className="w-full rounded-none border py-5 md:py-4 lg:w-auto"
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
						</div>
					</div>
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid grid-cols-2 gap-2 border-y border-dashed lg:grid-cols-4">
				<StatsCard
					label="Total Tickets"
					value={analytics.totalTickets}
					Icon={Ticket}
				/>

				<StatsCard
					label="Scanned Tickets"
					value={analytics.scannedTickets}
					Icon={QrCode}
				/>

				<StatsCard
					label="Unscanned Tickets"
					value={analytics.unscannedTickets}
					Icon={Clock}
				/>

				<StatsCard
					label="Total Amount"
					value={analytics.totalRevenue.toLocaleString()}
					Icon={TrendingUp}
				/>
			</div>

			{/* Charts & Additional Info */}
			<div className="mb-8 grid grid-cols-1 gap-4 border-y border-dashed lg:grid-cols-3">
				{/* Weekly Registered Tickets */}
				<WeeklyChart
					title="Weekly Registered Tickets"
					description="Ticket registrations over the last 7 days"
					data={analytics.registrationData.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					isLoading={false}
					color="var(--chart-1)"
					icon={<Ticket className="h-4 w-4" />}
				/>

				{/* Weekly Scanned Tickets */}
				<WeeklyChart
					title="Weekly Scanned Tickets"
					description="Ticket scans over the last 7 days"
					data={analytics.scanData.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					isLoading={false}
					color="var(--chart-2)"
					icon={<QrCode className="h-4 w-4" />}
				/>

				{/* Weekly Sales Amount */}
				<WeeklyChart
					title="Weekly Sales Amount"
					description="Sales revenue over the last 7 days"
					data={analytics.revenueData.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					isLoading={false}
					color="var(--chart-3)"
					icon={<DollarSign className="h-4 w-4" />}
				/>

				{/* Quick Stats */}
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
								<span className="font-semibold">{analytics.locations}</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-muted-foreground">
									<Clock className="size-4" />
									<span className="text-sm">Pending Tickets</span>
								</div>
								<span className="font-semibold text-orange-600 dark:text-orange-400">
									{analytics.pendingTickets}
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
							<div className="mb-2 text-muted-foreground text-sm">Progress</div>
							<div className="h-2 overflow-hidden rounded-none border border-emerald-500/50 bg-secondary">
								<div
									className="h-full bg-linear-to-r from-green-500 to-emerald-500 transition-all"
									style={{ width: `${scanRate}%` }}
								/>
							</div>
						</div>
					</div>
				</BlankCard>

				{/* Recent Scans */}
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
					className="lg:col-span-2"
				>
					<div className="h-[250px] ps-12">
						{analytics.recentScans.length > 0 ? (
							<div className="h-full overflow-y-auto border-l border-dashed">
								{analytics.recentScans.map((scan) => (
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
		</div>
	);
}
