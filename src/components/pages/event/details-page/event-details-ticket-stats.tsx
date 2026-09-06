"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, QrCode, Ticket } from "lucide-react";
import { useMemo } from "react";
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
import type { EventAnalytics } from "@/lib/api/dashboard/response";
import { getHourlyBreakdownByDay } from "@/lib/api/event/analytics";
import type { Event } from "@/lib/api/event/response";

interface EventDetailsTicketStatsProps {
	event: Event;
	// Mirrors the page's "Include re-scans" toggle so the on-screen charts and the
	// exported PDF count re-entry scans when it's on. The PDF report already labels
	// this variant ("Total Scans" + "N unique tickets checked in") based on the data.
	includeMultiScans?: boolean;
	// Fetched once by the parent page (shared with the Key Metrics summary cards
	// so both are scoped to the same date filter — no duplicate request).
	ticketAnalytics?: EventAnalytics;
	isLoading?: boolean;
	dateSelection: EventDateSelection;
	onDateSelectionChange: (value: EventDateSelection) => void;
}

export function EventDetailsTicketStats({
	event,
	includeMultiScans = false,
	ticketAnalytics,
	isLoading = false,
	dateSelection,
	onDateSelectionChange,
}: EventDetailsTicketStatsProps) {
	const analyticsParams = getAnalyticsParamsFromSelection(dateSelection);

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
				getHourlyBreakdownByDay(event.id.toString(), "tickets", {
					dateMode: analyticsParams.dateMode,
					startDate: analyticsParams.startDate,
					endDate: analyticsParams.endDate,
				}),
			enabled: shouldFetchHourlyBreakdown,
		});

	const { data: hourlyScans, isLoading: hourlyScansLoading } = useQuery({
		queryKey: [
			"event",
			event.id,
			"hourly_breakdown",
			"scans",
			dateSelection,
			includeMultiScans,
		],
		queryFn: () =>
			getHourlyBreakdownByDay(event.id.toString(), "scans", {
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
				includeMultiScans,
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
				totalVisitors: ticketAnalytics?.totalVisitors ?? 0,
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
						onChange={onDateSelectionChange}
					/>
					<ExportPdfButton
						data={pdfReportData}
						size="sm"
						variant="outline"
						disabled={isLoading || hourlyBreakdownLoading}
					/>
				</div>
			</div>
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
		</div>
	);
}
