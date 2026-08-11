"use client";

import { useQuery } from "@tanstack/react-query";
import { Banknote, Building2, ChartColumn } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { TimeSeriesChart } from "@/components/admin-ui/analytic";
import { ExhibitorExportDropdown } from "@/components/pages/analytics/exhibitor-export-dropdown";
import { prepareExhibitorReportData } from "@/components/pdf-reports";
import { Button } from "@/components/ui/button";
import {
	EventDateFilter,
	type EventDateSelection,
	getAnalyticsParamsFromSelection,
} from "@/components/ui/event-date-filter";
import {
	getExhibitorAnalytics,
	getTimeSeries,
} from "@/lib/api/event/analytics";
import type { Event } from "@/lib/api/event/response";

interface EventDetailsExhibitorStatsProps {
	event: Event;
}

export function EventDetailsExhibitorStats({
	event,
}: EventDetailsExhibitorStatsProps) {
	const [dateSelection, setDateSelection] = useState<EventDateSelection>({
		type: "all_time",
	});

	const analyticsParams = getAnalyticsParamsFromSelection(dateSelection);

	const { data: analytics } = useQuery({
		queryKey: ["exhibitor-analytics", event.id],
		queryFn: () => getExhibitorAnalytics({ id: event.id }),
	});

	const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
		queryKey: [
			"event",
			event.id,
			"analytics",
			"exhibitor_bookings",
			dateSelection,
		],
		queryFn: () =>
			getTimeSeries({
				eventId: event.id,
				metric: "exhibitor_bookings",
				groupBy: analyticsParams.groupBy,
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
			}),
	});
	const { data: revenueData, isLoading: revenueLoading } = useQuery({
		queryKey: [
			"event",
			event.id,
			"analytics",
			"exhibitor_revenue",
			dateSelection,
		],
		queryFn: () =>
			getTimeSeries({
				eventId: event.id,
				metric: "exhibitor_revenue",
				groupBy: analyticsParams.groupBy,
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
			}),
	});

	const toChartData = (points?: { period: string; value: number }[]) =>
		points?.map((p) => ({ date: p.period, value: p.value })) ?? [];

	const reportData = useMemo(() => {
		if (!analytics) return null;
		return prepareExhibitorReportData(
			{
				id: String(event.id),
				name: event.title,
				start_date: event.start_date,
				end_date: event.end_date,
			},
			analytics,
			{
				bookings: toChartData(bookingsData?.data),
				revenue: toChartData(revenueData?.data),
			},
		);
	}, [analytics, event, bookingsData, revenueData]);

	return (
		<div className="mb-8 space-y-4 border-y border-dashed">
			<div className="flex items-center justify-between px-4 pt-4">
				<h3 className="font-medium text-sm">Exhibitor Analytics</h3>
				<div className="flex items-center gap-2">
					<EventDateFilter
						eventStartDate={event.start_date}
						eventEndDate={event.end_date}
						value={dateSelection}
						onChange={setDateSelection}
					/>
					<ExhibitorExportDropdown eventId={event.id} reportData={reportData} />
					<Button variant="outline" size="sm" className="rounded-none" asChild>
						<Link href={`/event/${event.id}/analytics/exhibitor`}>
							<ChartColumn className="h-4 w-4" />
							<span className="ml-2">View Details</span>
						</Link>
					</Button>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<TimeSeriesChart
					title="Booth Bookings"
					description="Exhibitor booth bookings over time"
					data={toChartData(bookingsData?.data)}
					isLoading={bookingsLoading}
					color="var(--chart-1)"
					icon={<Building2 className="h-4 w-4" />}
				/>
				<TimeSeriesChart
					title="Booth Revenue"
					description="Collected exhibitor revenue over time"
					data={toChartData(revenueData?.data)}
					isLoading={revenueLoading}
					color="var(--chart-3)"
					icon={<Banknote className="h-4 w-4" />}
				/>
			</div>
		</div>
	);
}
