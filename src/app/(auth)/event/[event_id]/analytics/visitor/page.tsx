"use client";

import { useQuery } from "@tanstack/react-query";
import { QrCode, UserCheck, UserMinus, Users } from "lucide-react";
import { use, useMemo, useState } from "react";
import { StatsCard, TimeSeriesChart } from "@/components/admin-ui/analytic";
import {
	ExportPdfButton,
	prepareVisitorReportData,
} from "@/components/pdf-reports";
import {
	EventDateFilter,
	type EventDateSelection,
	getAnalyticsParamsFromSelection,
	getDateFilterLabelFromSelection,
} from "@/components/ui/event-date-filter";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventById } from "@/lib/api/event";
import {
	getHourlyBreakdownByDay,
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

export default function VisitorAnalyticsPage({
	params,
}: VisitorAnalyticsPageProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);
	const [dateSelection, setDateSelection] = useState<EventDateSelection>({
		type: "all_time",
	});

	// Fetch event to get start/end dates
	const { data: event, isLoading: eventLoading } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(event_id),
	});

	const analyticsParams = getAnalyticsParamsFromSelection(dateSelection);

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
		queryKey: ["event", eventId, "analytics", "visitors", dateSelection],
		queryFn: () =>
			getTimeSeries({
				eventId,
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
		queryKey: ["event", eventId, "analytics", "visitor_scans", dateSelection],
		queryFn: () =>
			getTimeSeries({
				eventId,
				metric: "visitor_scans",
				groupBy: analyticsParams.groupBy,
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
			}),
		enabled: !!event,
	});

	// Determine if event spans multiple days (for hourly breakdown)
	const isMultiDayEvent = useMemo(() => {
		if (!event) return false;
		const start = new Date(event.start_date);
		const end = new Date(event.end_date);
		return start.toDateString() !== end.toDateString();
	}, [event]);

	// Fetch hourly breakdown by day for multi-day events with all_time, pre_event, or event_duration filter
	const shouldFetchHourlyBreakdown =
		isMultiDayEvent &&
		(dateSelection.type === "all_time" ||
			dateSelection.type === "pre_event" ||
			dateSelection.type === "event_duration");

	const { data: hourlyRegistrations } = useQuery({
		queryKey: ["event", eventId, "hourly_breakdown", "visitors", dateSelection],
		queryFn: () =>
			getHourlyBreakdownByDay(event_id, "visitors", {
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
			}),
		enabled: !!event && shouldFetchHourlyBreakdown,
	});

	const { data: hourlyScans } = useQuery({
		queryKey: [
			"event",
			eventId,
			"hourly_breakdown",
			"visitor_scans",
			dateSelection,
		],
		queryFn: () =>
			getHourlyBreakdownByDay(event_id, "visitor_scans", {
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
			}),
		enabled: !!event && shouldFetchHourlyBreakdown,
	});

	// Transform visitor data for charts
	const transformData = (data?: { period: string; value: number }[]) =>
		data?.map((d) => ({ date: d.period, value: d.value })) ?? [];

	// Generate date filter label for PDF filename
	const dateFilterLabel = useMemo(() => {
		return getDateFilterLabelFromSelection(dateSelection, event?.start_date);
	}, [dateSelection, event?.start_date]);

	// Prepare report data for PDF export (always full report, ignores filter)
	const reportData = useMemo(() => {
		if (!event || !totalVisitors || !scannedVisitors || !unscannedVisitors)
			return null;

		// Include hourly breakdown for multi-day events
		const hourlyBreakdown =
			shouldFetchHourlyBreakdown && (hourlyRegistrations || hourlyScans)
				? {
						registrations: hourlyRegistrations,
						scans: hourlyScans,
					}
				: undefined;

		return prepareVisitorReportData(
			{
				id: event_id,
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
			hourlyBreakdown,
			dateFilterLabel,
		);
	}, [
		event,
		totalVisitors,
		scannedVisitors,
		unscannedVisitors,
		visitorsData,
		visitorScansData,
		event_id,
		shouldFetchHourlyBreakdown,
		hourlyRegistrations,
		hourlyScans,
		dateFilterLabel,
	]);

	const isLoading =
		statsLoading || eventLoading || visitorsLoading || visitorScansLoading;

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
							value={
								scannedVisitors?.totalScannedVisitors?.toLocaleString() || "0"
							}
							Icon={UserCheck}
						/>
						<StatsCard
							label="Unscanned Visitors"
							value={
								unscannedVisitors?.totalUnscannedVisitors?.toLocaleString() ||
								"0"
							}
							Icon={UserMinus}
						/>
					</div>
				)}
			</div>

			{/* Charts Section */}
			<div className="mb-12 space-y-4 border-y border-dashed">
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
						<ExportPdfButton data={reportData} disabled={isLoading} />
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<TimeSeriesChart
						title="Visitor Registrations"
						description="Visitor registrations over time"
						data={transformData(visitorsData?.data)}
						isLoading={eventLoading || visitorsLoading}
						color="var(--chart-1)"
						icon={<Users className="h-4 w-4" />}
					/>
					<TimeSeriesChart
						title="Visitor Scans"
						description="Visitor check-ins over time"
						data={transformData(visitorScansData?.data)}
						isLoading={eventLoading || visitorScansLoading}
						color="var(--chart-2)"
						icon={<QrCode className="h-4 w-4" />}
					/>
				</div>
			</div>
		</div>
	);
}
