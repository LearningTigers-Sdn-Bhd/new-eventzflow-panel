"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Activity,
	ArrowLeft,
	Clock,
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
import { ErrorState, LoadingState } from "@/components/data-state";
import { AnalyticsGraph } from "@/components/pages/analytics/analytics-graph";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTitle } from "@/components/ui/icon-heading";
import { useFormatDate } from "@/hooks/use-format-date";
import { getEventAnalytics } from "@/lib/api/dashboard";
import type { EventAnalytics as EventAnalyticsType } from "@/lib/api/dashboard/response";
import { cn } from "@/lib/utils";

type StatsCardProps = {
	label: string;
	value: React.ReactNode;
	Icon: React.ComponentType<{ className?: string }>;
	valueClassName?: string;
	iconContainerClassName?: string;
	iconClassName?: string;
};

function StatsCard({
	label,
	value,
	Icon,
	valueClassName,
	iconContainerClassName,
	iconClassName,
}: StatsCardProps) {
	return (
		<Card
			className={cn(
				"rounded-none border border-border/90 border-x border-dashed bg-muted/50 p-0 shadow-none lg:border-l",
			)}
		>
			<CardContent className="h-full p-0">
				<div className="flex h-full flex-col items-center justify-between gap-2 md:flex-row md:gap-0">
					<div className="flex h-full items-center justify-center px-6 pt-3 md:py-0">
						<Icon className={cn("size-7 md:size-6")} />
					</div>
					<div className="flex h-full w-full flex-col justify-center px-4 pb-4 text-center md:px-0 md:py-4 md:text-left">
						<p className={cn("text-balance align-top font-semibold text-sm")}>
							{label}
						</p>
						<p className="font-bold text-xl tracking-tight">{value}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

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

			{/* Charts Section */}
			<div className="mb-8 space-y-3 border-y border-dashed">
				<AnalyticsGraph
					weeklyRegisteredTickets={analytics.registrationData.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					weeklyScannedTickets={analytics.scanData.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					weeklySalesAmount={analytics.revenueData.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					isLoading={false}
				/>

				{/* Additional Info & Recent Scans */}
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
					{/* Quick Stats */}
					<Card className="h-full gap-0 rounded-none border border-border/90 border-x border-dashed p-0 shadow-none lg:border-l">
						<CardHeader className="p-0">
							<div className="flex items-center gap-4">
								<div className="border-r border-dashed p-4">
									<Search className="size-4" />
								</div>
								<div className="flex flex-col gap-1 px-2 py-3">
									<CardTitle className="text-sm">Quick Info</CardTitle>
								</div>
							</div>
						</CardHeader>
						<CardContent className="flex h-full flex-col justify-between bg-accent p-4">
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
						</CardContent>
					</Card>

					{/* Recent Scans */}
					<Card className="gap-0 rounded-none border border-border/90 border-x border-dashed p-0 shadow-none lg:col-span-2 lg:border-l">
						<CardHeader className="p-0">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="border-r border-dashed p-4">
										<ScanFace className="size-4" />
									</div>
									<div className="flex flex-col gap-1 px-2 py-3">
										<CardTitle className="text-sm">Recent Scans</CardTitle>
									</div>
								</div>
								<div className="flex items-center gap-2 px-2">
									<Button
										className="rounded-none border bg-accent"
										variant="outline"
										size="sm"
										onClick={() =>
											router.push(
												`/event/${eventId}/scanned-logs` as Parameters<
													typeof router.push
												>[0],
											)
										}
									>
										<Scan className="mr-2 h-4 w-4" />
										View All Scan Logs
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent className="h-[250px] bg-accent p-0">
							<div className="h-full ps-12">
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
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
