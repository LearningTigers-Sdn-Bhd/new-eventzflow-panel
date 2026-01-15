"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, QrCode, Ticket, Users } from "lucide-react";
import { useState } from "react";
import { TimeSeriesChart } from "@/components/admin-ui/analytic";
import {
	getDateRangeFromPreset,
	getGroupByFromPreset,
	TimeRangeFilter,
	type TimeRangePreset,
} from "@/components/ui/time-range-filter";
import { getEventAnalytics } from "@/lib/api/dashboard";
import { getTimeSeries } from "@/lib/api/event/analytics";

interface EventDetailsTimeSeriesStatsProps {
	isTicketEvent: boolean;
	eventId: string;
}

export function EventDetailsTimeSeriesStats({
	isTicketEvent,
	eventId,
}: EventDetailsTimeSeriesStatsProps) {
	const [timeRange, setTimeRange] = useState<TimeRangePreset>("last_7_days");
	const eventIdNum = Number.parseInt(eventId, 10);

	// Get date range and grouping based on selected preset
	const dateRange = getDateRangeFromPreset(timeRange);
	const groupBy = getGroupByFromPreset(timeRange);

	// Fetch ticket analytics
	const { data: ticketAnalytics, isLoading: ticketLoading } = useQuery({
		queryKey: ["event-analytics", eventId, "time-series", timeRange],
		queryFn: () =>
			getEventAnalytics(eventId, {
				startDate: dateRange?.startDate,
				endDate: dateRange?.endDate,
				groupBy,
			}),
		enabled: isTicketEvent,
	});

	// Fetch visitor registrations
	const { data: visitorsData, isLoading: visitorsLoading } = useQuery({
		queryKey: ["event", eventIdNum, "analytics", "visitors", timeRange],
		queryFn: () =>
			getTimeSeries({
				eventId: eventIdNum,
				metric: "visitors",
				groupBy,
				startDate: dateRange?.startDate,
				endDate: dateRange?.endDate,
			}),
		enabled: !isTicketEvent,
	});

	// Fetch visitor scans
	const { data: visitorScansData, isLoading: visitorScansLoading } = useQuery({
		queryKey: ["event", eventIdNum, "analytics", "visitor_scans", timeRange],
		queryFn: () =>
			getTimeSeries({
				eventId: eventIdNum,
				metric: "visitor_scans",
				groupBy,
				startDate: dateRange?.startDate,
				endDate: dateRange?.endDate,
			}),
		enabled: !isTicketEvent,
	});

	// Transform visitor data for charts
	const transformData = (data?: { period: string; value: number }[]) =>
		data?.map((d) => ({ date: d.period, value: d.value })) ?? [];

	const isLoading = isTicketEvent
		? ticketLoading
		: visitorsLoading || visitorScansLoading;

	return (
		<div className="mb-8 space-y-4 border-y border-dashed">
			<div className="flex items-center justify-between px-4 pt-4">
				<h3 className="font-medium text-sm">Analytics Trends</h3>
				<TimeRangeFilter value={timeRange} onChange={setTimeRange} />
			</div>
			{isTicketEvent ? (
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
					<TimeSeriesChart
						title="Ticket Registrations"
						description="Ticket registrations over time"
						data={ticketAnalytics?.registrationData}
						isLoading={isLoading}
						color="var(--chart-1)"
						icon={<Ticket className="h-4 w-4" />}
					/>
					<TimeSeriesChart
						title="Ticket Scans"
						description="Ticket scans over time"
						data={ticketAnalytics?.scanData}
						isLoading={isLoading}
						color="var(--chart-2)"
						icon={<QrCode className="h-4 w-4" />}
					/>
					<TimeSeriesChart
						title="Revenue"
						description="Sales revenue over time"
						data={ticketAnalytics?.revenueData}
						isLoading={isLoading}
						color="var(--chart-3)"
						icon={<DollarSign className="h-4 w-4" />}
					/>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<TimeSeriesChart
						title="Visitor Registrations"
						description="Visitor registrations over time"
						data={transformData(visitorsData?.data)}
						isLoading={isLoading}
						color="var(--chart-1)"
						icon={<Users className="h-4 w-4" />}
					/>
					<TimeSeriesChart
						title="Visitor Scans"
						description="Visitor check-ins over time"
						data={transformData(visitorScansData?.data)}
						isLoading={isLoading}
						color="var(--chart-2)"
						icon={<QrCode className="h-4 w-4" />}
					/>
				</div>
			)}
		</div>
	);
}
