"use client";

import { useQuery } from "@tanstack/react-query";
import { QrCode, UserCheck, UserMinus, Users } from "lucide-react";
import { use, useState } from "react";
import { StatsCard, TimeSeriesChart } from "@/components/admin-ui/analytic";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getDateRangeFromPreset,
	getGroupByFromPreset,
	TimeRangeFilter,
	type TimeRangePreset,
} from "@/components/ui/time-range-filter";
import {
	getTimeSeries,
	getTotalScannedVisitors,
	getTotalUnscannedVisitors,
	getTotalVisitors,
} from "@/lib/api/event/analytics";

interface VisitorAnalyticsPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function VisitorAnalyticsPage({ params }: VisitorAnalyticsPageProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);
	const [timeRange, setTimeRange] = useState<TimeRangePreset>("last_7_days");

	const dateRange = getDateRangeFromPreset(timeRange);
	const groupBy = getGroupByFromPreset(timeRange);

	// Fetch visitor stats
	const { data: totalVisitors, isLoading: totalLoading } = useQuery({
		queryKey: ["event", eventId, "total_visitors"],
		queryFn: () => getTotalVisitors({ id: eventId }),
	});

	const { data: scannedVisitors, isLoading: scannedLoading } = useQuery({
		queryKey: ["event", eventId, "scanned_visitors"],
		queryFn: () => getTotalScannedVisitors({ id: eventId }),
	});

	const { data: unscannedVisitors, isLoading: unscannedLoading } = useQuery({
		queryKey: ["event", eventId, "unscanned_visitors"],
		queryFn: () => getTotalUnscannedVisitors({ id: eventId }),
	});

	const statsLoading = totalLoading || scannedLoading || unscannedLoading;

	// Fetch visitor registrations time series
	const { data: visitorsData, isLoading: visitorsLoading } = useQuery({
		queryKey: ["event", eventId, "analytics", "visitors", timeRange],
		queryFn: () =>
			getTimeSeries({
				eventId,
				metric: "visitors",
				groupBy,
				startDate: dateRange?.startDate,
				endDate: dateRange?.endDate,
			}),
	});

	// Fetch visitor scans time series
	const { data: visitorScansData, isLoading: visitorScansLoading } = useQuery({
		queryKey: ["event", eventId, "analytics", "visitor_scans", timeRange],
		queryFn: () =>
			getTimeSeries({
				eventId,
				metric: "visitor_scans",
				groupBy,
				startDate: dateRange?.startDate,
				endDate: dateRange?.endDate,
			}),
	});

	// Transform visitor data for charts
	const transformData = (data?: { period: string; value: number }[]) =>
		data?.map((d) => ({ date: d.period, value: d.value })) ?? [];

	if (Number.isNaN(eventId)) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="text-muted-foreground">Invalid event ID</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Stats Cards Section */}
			<div className="space-y-4">
				{statsLoading ? (
					<div className="grid grid-cols-1 gap-2 rounded-none border-y border-dashed p-0 md:grid-cols-3">
						{["total", "scanned", "unscanned"].map((key) => (
							<div
								key={key}
								className="h-full rounded-none border border-border/90 border-x border-dashed bg-muted/50 p-0 shadow-none lg:border-l"
							>
								<div className="h-full p-0">
									<div className="flex h-full flex-col items-center justify-between gap-2 md:flex-row md:gap-0">
										<div className="flex h-full items-center justify-center px-6 pt-3 md:py-0">
											<Skeleton className="size-7 md:size-6" />
										</div>
										<div className="flex h-full w-full flex-col justify-center gap-1 px-4 pb-4 text-center md:px-0 md:py-4 md:text-left">
											<Skeleton className="h-4 w-20" />
											<Skeleton className="h-6 w-16" />
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 gap-2 rounded-none border-y border-dashed p-0 md:grid-cols-3">
						<StatsCard
							label="Total Visitors"
							value={totalVisitors?.totalVisitors?.toLocaleString() || "0"}
							Icon={Users}
						/>
						<StatsCard
							label="Scanned Visitors"
							value={scannedVisitors?.totalScannedVisitors?.toLocaleString() || "0"}
							Icon={UserCheck}
						/>
						<StatsCard
							label="Unscanned Visitors"
							value={unscannedVisitors?.totalUnscannedVisitors?.toLocaleString() || "0"}
							Icon={UserMinus}
						/>
					</div>
				)}
			</div>

			{/* Charts Section */}
			<div className="mb-12 space-y-4 border-y border-dashed">
				<div className="flex items-center justify-between px-4 pt-4">
					<h3 className="font-medium text-sm">Analytics Trends</h3>
					<TimeRangeFilter value={timeRange} onChange={setTimeRange} />
				</div>

				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<TimeSeriesChart
						title="Visitor Registrations"
						description="Visitor registrations over time"
						data={transformData(visitorsData?.data)}
						isLoading={visitorsLoading}
						color="var(--chart-1)"
						icon={<Users className="h-4 w-4" />}
					/>
					<TimeSeriesChart
						title="Visitor Scans"
						description="Visitor check-ins over time"
						data={transformData(visitorScansData?.data)}
						isLoading={visitorScansLoading}
						color="var(--chart-2)"
						icon={<QrCode className="h-4 w-4" />}
					/>
				</div>
			</div>
		</div>
	);
}
