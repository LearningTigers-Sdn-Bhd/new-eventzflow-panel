"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useState } from "react";
import { AnalyticsCounter } from "@/components/pages/analytics/analytics-counter";
import { AnalyticsGraph } from "@/components/pages/analytics/analytics-graph";
import {
	getDateRangeFromPreset,
	getGroupByFromPreset,
	TimeRangeFilter,
	type TimeRangePreset,
} from "@/components/ui/time-range-filter";
import { getEventAnalytics } from "@/lib/api/dashboard";

interface AnalyticsPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);
	const [timeRange, setTimeRange] = useState<TimeRangePreset>("last_7_days");

	// Get date range and grouping based on selected preset
	const dateRange = getDateRangeFromPreset(timeRange);
	const groupBy = getGroupByFromPreset(timeRange);

	// Single aggregated query to reduce network calls and token refreshes
	const { data, isLoading } = useQuery({
		queryKey: ["event", eventId, "analytics", timeRange],
		queryFn: () =>
			getEventAnalytics(event_id, {
				startDate: dateRange?.startDate,
				endDate: dateRange?.endDate,
				groupBy,
			}),
	});

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
			<div>
				<h2 className="mb-4 font-semibold text-lg">Overview</h2>
				<AnalyticsCounter
					totalTickets={data?.totalTickets}
					totalScannedTickets={data?.scannedTickets}
					totalUnscannedTickets={data?.unscannedTickets}
					totalAmountPrice={data?.totalRevenue}
					isLoading={isLoading}
				/>
			</div>

			{/* Charts Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-lg">Analytics</h2>
					<TimeRangeFilter value={timeRange} onChange={setTimeRange} />
				</div>
				<AnalyticsGraph
					registrationData={data?.registrationData}
					scanData={data?.scanData}
					revenueData={data?.revenueData}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
}
