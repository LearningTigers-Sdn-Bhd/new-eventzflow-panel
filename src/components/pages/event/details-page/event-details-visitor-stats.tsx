"use client";

import { useQuery } from "@tanstack/react-query";
import { QrCode, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { TimeSeriesChart } from "@/components/admin-ui/analytic";
import {
	ExportPdfButton,
	prepareVisitorReportData,
} from "@/components/pdf-reports";
import {
	EventDateFilter,
	getAnalyticsParamsFromSelection,
	type EventDateSelection,
} from "@/components/ui/event-date-filter";
import { getEventById } from "@/lib/api/event";
import {
	getTimeSeries,
	getTotalScannedVisitors,
	getTotalUnscannedVisitors,
	getTotalVisitors,
} from "@/lib/api/event/analytics";

interface EventDetailsVisitorStatsProps {
	eventId: string;
}

export function EventDetailsVisitorStats({
	eventId,
}: EventDetailsVisitorStatsProps) {
	const [dateSelection, setDateSelection] = useState<EventDateSelection>({
		type: "all_time",
	});
	const eventIdNum = Number.parseInt(eventId, 10);

	// Fetch event to get start/end dates
	const { data: event, isLoading: eventLoading } = useQuery({
		queryKey: ["event", eventIdNum],
		queryFn: () => getEventById(eventId),
	});

	const analyticsParams = getAnalyticsParamsFromSelection(dateSelection);

	// Fetch visitor stats (same as visitor analytics page)
	const { data: totalVisitors, isLoading: totalLoading } = useQuery({
		queryKey: ["event", eventIdNum, "total_visitors"],
		queryFn: () => getTotalVisitors({ id: eventIdNum }),
	});

	const { data: scannedVisitors, isLoading: scannedLoading } = useQuery({
		queryKey: ["event", eventIdNum, "scanned_visitors"],
		queryFn: () => getTotalScannedVisitors({ id: eventIdNum }),
	});

	const { data: unscannedVisitors, isLoading: unscannedLoading } = useQuery({
		queryKey: ["event", eventIdNum, "unscanned_visitors"],
		queryFn: () => getTotalUnscannedVisitors({ id: eventIdNum }),
	});

	// Fetch visitor registrations time series
	const { data: visitorsData, isLoading: visitorsLoading } = useQuery({
		queryKey: ["event", eventIdNum, "analytics", "visitors", dateSelection],
		queryFn: () =>
			getTimeSeries({
				eventId: eventIdNum,
				metric: "visitors",
				groupBy: analyticsParams.groupBy,
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
			}),
		enabled: !!event,
	});

	// Fetch visitor scans time series
	const { data: visitorScansData, isLoading: visitorScansLoading } = useQuery({
		queryKey: ["event", eventIdNum, "analytics", "visitor_scans", dateSelection],
		queryFn: () =>
			getTimeSeries({
				eventId: eventIdNum,
				metric: "visitor_scans",
				groupBy: analyticsParams.groupBy,
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
			}),
		enabled: !!event,
	});

	// Transform visitor data for charts
	const transformData = (data?: { period: string; value: number }[]) =>
		data?.map((d) => ({ date: d.period, value: d.value })) ?? [];

	// Prepare report data for PDF export
	const pdfReportData = useMemo(() => {
		if (!event || !totalVisitors || !scannedVisitors || !unscannedVisitors) return null;
		return prepareVisitorReportData(
			{
				id: eventId,
				name: event.title,
				start_date: event.start_date,
				end_date: event.end_date,
			},
			{
				totalVisitors: totalVisitors.totalVisitors ?? 0,
				scannedVisitors: scannedVisitors.totalScannedVisitors ?? 0,
				unscannedVisitors: unscannedVisitors.totalUnscannedVisitors ?? 0,
			},
			{
				registrations: transformData(visitorsData?.data),
				scans: transformData(visitorScansData?.data),
			},
		);
	}, [event, totalVisitors, scannedVisitors, unscannedVisitors, visitorsData, visitorScansData, eventId]);

	const statsLoading = totalLoading || scannedLoading || unscannedLoading;
	const isLoading = eventLoading || statsLoading || visitorsLoading || visitorScansLoading;

	return (
		<div className="mb-8 space-y-4 border-y border-dashed">
			<div className="flex items-center justify-between px-4 pt-4">
				<h3 className="font-medium text-sm">Analytics Trends</h3>
				<div className="flex items-center gap-2">
					{event && (
						<EventDateFilter
							eventStartDate={event.start_date}
							eventEndDate={event.end_date}
							value={dateSelection}
							onChange={setDateSelection}
						/>
					)}
					<ExportPdfButton
						data={pdfReportData}
						size="sm"
						variant="outline"
						disabled={isLoading}
					/>
				</div>
			</div>
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
		</div>
	);
}
