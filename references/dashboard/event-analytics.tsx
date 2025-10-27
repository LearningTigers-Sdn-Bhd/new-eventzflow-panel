"use client";

import { LoadingState, ErrorState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/use-format-date";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
	Activity,
	ArrowLeft,
	MapPin,
	QrCode,
	Scan,
	Ticket,
	TrendingUp,
	Users,
	Clock,
} from "lucide-react";
import { AnalyticsGraph } from "@/components/pages/analytics/analytics-graph";

interface EventAnalyticsProps {
	eventId: string;
	onBack: () => void;
	showBackButton?: boolean;
}

export function EventAnalytics({ eventId, onBack, showBackButton = true }: EventAnalyticsProps) {
	const router = useRouter();
	const { formatDate } = useFormatDate();
	const {
		data: analytics,
		isLoading,
		error,
	} = useQuery(trpc.dashboard.getEventAnalytics.queryOptions({ eventId }));

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

	const scanRate = analytics.totalTickets > 0
		? Math.round((analytics.scannedTickets / analytics.totalTickets) * 100)
		: 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					{showBackButton && (
						<Button variant="ghost" size="icon" onClick={onBack}>
							<ArrowLeft className="h-5 w-5" />
						</Button>
					)}
					<div>
						<div className="flex items-center gap-3">
							<h2 className="font-bold text-2xl tracking-tight">
								{analytics.eventName}
							</h2>
							<Badge
								variant={analytics.status === "active" ? "default" : "destructive"}
							>
								{analytics.status === "active" ? "Active" : "Inactive"}
							</Badge>
						</div>
						<p className="text-muted-foreground mt-1">
							Track your event efficiently
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => router.push("/scan")}>
						<QrCode className="mr-2 h-4 w-4" />
						Scan Tickets
					</Button>
					<Button onClick={() => router.push(`/event/${eventId}/tickets` as any)}>
						<Ticket className="mr-2 h-4 w-4" />
						View All Tickets
					</Button>
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm font-medium">
									Total Tickets
								</p>
								<p className="font-bold text-3xl mt-2">{analytics.totalTickets}</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
								<Ticket className="h-6 w-6 text-blue-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm font-medium">
									Scanned Tickets
								</p>
								<p className="font-bold text-3xl mt-2 text-green-600 dark:text-green-400">
									{analytics.scannedTickets}
								</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
								<QrCode className="h-6 w-6 text-green-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm font-medium">
									Unscanned Tickets
								</p>
								<p className="font-bold text-3xl mt-2 text-orange-600 dark:text-orange-400">
									{analytics.unscannedTickets}
								</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
								<Clock className="h-6 w-6 text-orange-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm font-medium">
									Total Amount
								</p>
								<p className="font-bold text-3xl mt-2">
									{analytics.totalRevenue.toLocaleString()}
								</p>
							</div>
							<div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
								<TrendingUp className="h-6 w-6 text-purple-500" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

		{/* Charts Section */}
		<AnalyticsGraph
			weeklyRegisteredTickets={analytics.registrationData.map(d => ({
				date: d.date,
				count: d.value
			}))}
			weeklyScannedTickets={analytics.scanData.map(d => ({
				date: d.date,
				count: d.value
			}))}
			weeklySalesAmount={analytics.revenueData.map(d => ({
				date: d.date,
				count: d.value
			}))}
			isLoading={false}
		/>

			{/* Additional Info & Recent Scans */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Quick Stats */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Quick Info</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-muted-foreground">
								<MapPin className="h-4 w-4" />
								<span className="text-sm">Locations</span>
							</div>
							<span className="font-semibold">{analytics.locations}</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-muted-foreground">
								<Clock className="h-4 w-4" />
								<span className="text-sm">Pending Tickets</span>
							</div>
							<span className="font-semibold text-orange-600 dark:text-orange-400">
								{analytics.pendingTickets}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-muted-foreground">
								<Activity className="h-4 w-4" />
								<span className="text-sm">Scan Rate</span>
							</div>
							<span className="font-semibold">{scanRate}%</span>
						</div>
						<div className="mt-4">
							<div className="text-muted-foreground text-sm mb-2">
								Progress
							</div>
							<div className="h-2 bg-secondary rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
									style={{ width: `${scanRate}%` }}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Recent Scans */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Recent Scans</CardTitle>
							<Button variant="outline" size="sm" onClick={() => router.push(`/event/${eventId}/scanned-logs` as any)}>
								<Scan className="mr-2 h-4 w-4" />
								View All Scan Logs
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{analytics.recentScans.length > 0 ? (
								analytics.recentScans.map((scan) => (
									<div
										key={scan.id}
										className="flex items-center justify-between p-3 rounded-lg border"
									>
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
												<Users className="h-5 w-5 text-primary" />
											</div>
											<div>
												<p className="font-medium text-sm">{scan.ticketHolder}</p>
												<p className="text-muted-foreground text-xs">
													{scan.email}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium">{scan.location}</p>
											<p className="text-muted-foreground text-xs">
												{formatDate(scan.timestamp)}
											</p>
										</div>
									</div>
								))
							) : (
								<div className="text-center py-8 text-muted-foreground">
									<Scan className="h-12 w-12 mx-auto mb-2 opacity-50" />
									<p className="text-sm">No scans yet</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
