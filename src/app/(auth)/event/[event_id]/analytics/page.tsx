"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { AnalyticsCounter } from "@/components/pages/analytics/analytics-counter";
import { AnalyticsGraph } from "@/components/pages/analytics/analytics-graph";
import { getEventAnalytics } from "@/lib/api/dashboard";

interface AnalyticsPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);

	// Single aggregated query to reduce network calls and token refreshes
	const { data, isLoading } = useQuery({
		queryKey: ["event", eventId, "analytics"],
		queryFn: () => getEventAnalytics(event_id),
	});

	if (Number.isNaN(eventId)) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="text-muted-foreground">Invalid event ID</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
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
			<div>
				<h2 className="mb-4 font-semibold text-lg">Weekly Analytics</h2>
				<AnalyticsGraph
					weeklyRegisteredTickets={data?.registrationData?.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					weeklyScannedTickets={data?.scanData?.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					weeklySalesAmount={data?.revenueData?.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
}
