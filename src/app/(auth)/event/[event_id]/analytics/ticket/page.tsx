"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, DollarSign, Ticket, XCircle } from "lucide-react";
import { use, useState } from "react";
import { StatsCard } from "@/components/admin-ui/analytic";
import { AnalyticsGraph } from "@/components/pages/analytics/analytics-graph";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getDateRangeFromPreset,
	getGroupByFromPreset,
	TimeRangeFilter,
	type TimeRangePreset,
} from "@/components/ui/time-range-filter";
import { getEventAnalytics } from "@/lib/api/dashboard";

interface TicketAnalyticsPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function TicketAnalyticsPage({ params }: TicketAnalyticsPageProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);
	const [timeRange, setTimeRange] = useState<TimeRangePreset>("last_7_days");

	const dateRange = getDateRangeFromPreset(timeRange);
	const groupBy = getGroupByFromPreset(timeRange);

	const { data, isLoading } = useQuery({
		queryKey: ["event", eventId, "analytics", timeRange],
		queryFn: () =>
			getEventAnalytics(event_id, {
				startDate: dateRange?.startDate,
				endDate: dateRange?.endDate,
				groupBy,
			}),
	});

	const formatCurrency = (amount?: number) => {
		if (!amount) return "$0";
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

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
				{isLoading ? (
					<div className="grid grid-cols-2 gap-2 rounded-none border-y border-dashed p-0 lg:grid-cols-4">
						{[
							"total-tickets",
							"scanned-tickets",
							"unscanned-tickets",
							"total-amount",
						].map((key) => (
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
					<div className="grid grid-cols-2 gap-2 rounded-none border-y border-dashed p-0 lg:grid-cols-4">
						<StatsCard
							label="Total Tickets"
							value={data?.totalTickets?.toLocaleString() || "0"}
							Icon={Ticket}
						/>
						<StatsCard
							label="Scanned Tickets"
							value={data?.scannedTickets?.toLocaleString() || "0"}
							Icon={CheckCircle2}
						/>
						<StatsCard
							label="Unscanned Tickets"
							value={data?.unscannedTickets?.toLocaleString() || "0"}
							Icon={XCircle}
						/>
						<StatsCard
							label="Total Amount"
							value={formatCurrency(data?.totalRevenue)}
							Icon={DollarSign}
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
