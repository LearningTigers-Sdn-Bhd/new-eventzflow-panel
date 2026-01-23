"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, QrCode, Ticket, Users } from "lucide-react";
import { useState } from "react";
import { TimeSeriesChart } from "@/components/admin-ui/analytic";
import {
	ExportPdfButton,
	prepareTicketReportData,
	prepareVisitorReportData,
} from "@/components/pdf-reports";
import {
	EventDateFilter,
	getAnalyticsParamsFromSelection,
	type EventDateSelection,
} from "@/components/ui/event-date-filter";
import { getEventAnalytics } from "@/lib/api/dashboard";
import { getEventById } from "@/lib/api/event";
import { getTimeSeries } from "@/lib/api/event/analytics";

interface EventDetailsTimeSeriesStatsProps {
	isTicketEvent: boolean;
	eventId: string;
}

export function EventDetailsTimeSeriesStats({
	isTicketEvent,
	eventId,
}: EventDetailsTimeSeriesStatsProps) {
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

	// Fetch ticket analytics
	const { data: ticketAnalytics, isLoading: ticketLoading } = useQuery({
		queryKey: ["event-analytics", eventId, "time-series", dateSelection],
		queryFn: () =>
			getEventAnalytics(eventId, {
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
				dateMode: analyticsParams.dateMode,
				groupBy: analyticsParams.groupBy,
			}),
		enabled: isTicketEvent && !!event,
	});

	// Fetch visitor registrations
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
		enabled: !isTicketEvent && !!event,
	});

	// Fetch visitor scans
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
		enabled: !isTicketEvent && !!event,
	});

	// Transform visitor data for charts
	const transformData = (data?: { period: string; value: number }[]) =>
		data?.map((d) => ({ date: d.period, value: d.value })) ?? [];

	// Prepare PDF report data based on event type
	const pdfReportData = event
		? isTicketEvent
			? prepareTicketReportData(
					{
						id: eventId,
						name: event.title,
						start_date: event.start_date,
						end_date: event.end_date,
					},
					{
						totalTickets: ticketAnalytics?.totalTickets ?? 0,
						scannedTickets: ticketAnalytics?.scannedTickets ?? 0,
						unscannedTickets: ticketAnalytics?.unscannedTickets ?? 0,
						totalRevenue: ticketAnalytics?.totalRevenue ?? 0,
					},
					{
						registrations: ticketAnalytics?.registrationData,
						scans: ticketAnalytics?.scanData,
						revenue: ticketAnalytics?.revenueData,
					},
				)
			: prepareVisitorReportData(
					{
						id: eventId,
						name: event.title,
						start_date: event.start_date,
						end_date: event.end_date,
					},
					{
						totalVisitors: visitorsData?.total ?? 0,
						scannedVisitors: visitorScansData?.total ?? 0,
						unscannedVisitors:
							(visitorsData?.total ?? 0) - (visitorScansData?.total ?? 0),
					},
					{
						registrations: transformData(visitorsData?.data),
						scans: transformData(visitorScansData?.data),
					},
				)
		: null;

	const isLoading = eventLoading || (isTicketEvent
		? ticketLoading
		: visitorsLoading || visitorScansLoading);

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
					/>
				</div>
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
