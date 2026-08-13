"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, QrCode, Ticket } from "lucide-react";
import { useMemo, useState } from "react";
import { TimeSeriesChart } from "@/components/admin-ui/analytic";
import {
	ExportPdfButton,
	prepareTicketReportData,
} from "@/components/pdf-reports";
import {
	EventDateFilter,
	type EventDateSelection,
	getAnalyticsParamsFromSelection,
	getDateFilterLabelFromSelection,
} from "@/components/ui/event-date-filter";
import { getEventAnalytics } from "@/lib/api/dashboard";
import { getHourlyBreakdownByDay } from "@/lib/api/event/analytics";
import type { Event } from "@/lib/api/event/response";

interface EventDetailsTicketStatsProps {
	event: Event;
}

export function EventDetailsTicketStats({
	event,
}: EventDetailsTicketStatsProps) {
	const [dateSelection, setDateSelection] = useState<EventDateSelection>({
		type: "all_time",
	});

	const analyticsParams = getAnalyticsParamsFromSelection(dateSelection);

	// Fetch ticket analytics with time-series data
	const { data: ticketAnalytics, isLoading: ticketLoading } = useQuery({
		queryKey: [
			"event-analytics",
			event.id.toString(),
			"time-series",
			dateSelection,
		],
		queryFn: () =>
			getEventAnalytics(event.id.toString(), {
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
				dateMode: analyticsParams.dateMode,
				groupBy: analyticsParams.groupBy,
			}),
	});

	// Fetch hourly breakdown by day for all_time, pre_event, or event_duration filter
	// (works for single-day events too — just renders one day's bars)
	const shouldFetchHourlyBreakdown =
		dateSelection.type === "all_time" ||
		dateSelection.type === "pre_event" ||
		dateSelection.type === "event_duration";

	const { data: hourlyRegistrations, isLoading: hourlyRegistrationsLoading } =
		useQuery({
			queryKey: [
				"event",
				event.id,
				"hourly_breakdown",
				"tickets",
				dateSelection,
			],
			queryFn: () =>
				getHourlyBreakdownByDay(event.id, "tickets", {
					dateMode: analyticsParams.dateMode,
					startDate: analyticsParams.startDate,
					endDate: analyticsParams.endDate,
				}),
			enabled: shouldFetchHourlyBreakdown,
		});

	const { data: hourlyScans, isLoading: hourlyScansLoading } = useQuery({
		queryKey: ["event", event.id, "hourly_breakdown", "scans", dateSelection],
		queryFn: () =>
			getHourlyBreakdownByDay(event.id, "scans", {
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
			}),
		enabled: shouldFetchHourlyBreakdown,
	});

	const dateFilterLabel = useMemo(
		() => getDateFilterLabelFromSelection(dateSelection, event.start_date),
		[dateSelection, event.start_date],
	);

	// Hourly breakdown queries only run for certain filters — don't block
	// export on them when they're not enabled (would never resolve).
	const hourlyBreakdownLoading =
		shouldFetchHourlyBreakdown &&
		(hourlyRegistrationsLoading || hourlyScansLoading);

	// Prepare PDF report data
	const pdfReportData = useMemo(() => {
		// Include hourly breakdown for multi-day events
		const hourlyBreakdown =
			shouldFetchHourlyBreakdown && (hourlyRegistrations || hourlyScans)
				? {
						registrations: hourlyRegistrations,
						scans: hourlyScans,
					}
				: undefined;

		return prepareTicketReportData(
			{
				id: event.id.toString(),
				name: event.title,
				start_date: event.start_date,
				end_date: event.end_date,
			},
			{
				totalTickets: ticketAnalytics?.totalTickets ?? 0,
				paidTickets: ticketAnalytics?.paidTickets ?? 0,
				pendingTickets: ticketAnalytics?.pendingTickets ?? 0,
				scannedTickets: ticketAnalytics?.scannedTickets ?? 0,
				unscannedTickets: ticketAnalytics?.unscannedTickets ?? 0,
				totalRevenue: ticketAnalytics?.totalRevenue ?? 0,
				pendingRevenue: ticketAnalytics?.pendingRevenue ?? 0,
			},
			{
				registrations: ticketAnalytics?.registrationData,
				scans: ticketAnalytics?.scanData,
				revenue: ticketAnalytics?.revenueData,
			},
			hourlyBreakdown,
			dateFilterLabel,
		);
	}, [
		event,
		ticketAnalytics,
		shouldFetchHourlyBreakdown,
		hourlyRegistrations,
		hourlyScans,
		dateFilterLabel,
	]);

	return (
		<div className="mb-8 space-y-4 border-y border-dashed">
			<div className="flex items-center justify-between px-4 pt-4">
				<h3 className="font-medium text-sm">Analytics Trends</h3>
				<div className="flex items-center gap-2">
					<EventDateFilter
						eventStartDate={event.start_date}
						eventEndDate={event.end_date}
						value={dateSelection}
						onChange={setDateSelection}
					/>
					<ExportPdfButton
						data={pdfReportData}
						size="sm"
						variant="outline"
						disabled={ticketLoading || hourlyBreakdownLoading}
					/>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<TimeSeriesChart
					title="Ticket Registrations"
					description="Ticket registrations over time"
					data={ticketAnalytics?.registrationData}
					isLoading={ticketLoading}
					color="var(--chart-1)"
					icon={<Ticket className="h-4 w-4" />}
				/>
				<TimeSeriesChart
					title="Ticket Scans"
					description="Ticket scans over time"
					data={ticketAnalytics?.scanData}
					isLoading={ticketLoading}
					color="var(--chart-2)"
					icon={<QrCode className="h-4 w-4" />}
				/>
				<TimeSeriesChart
					title="Revenue"
					description="Sales revenue over time"
					data={ticketAnalytics?.revenueData}
					isLoading={ticketLoading}
					color="var(--chart-3)"
					icon={<DollarSign className="h-4 w-4" />}
				/>
			</div>
		</div>
	);
}
