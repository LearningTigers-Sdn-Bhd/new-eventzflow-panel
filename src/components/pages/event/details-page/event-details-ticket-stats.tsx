"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, QrCode, Ticket } from "lucide-react";
import { useState } from "react";
import { TimeSeriesChart } from "@/components/admin-ui/analytic";
import {
	ExportPdfButton,
	prepareTicketReportData,
} from "@/components/pdf-reports";
import {
	EventDateFilter,
	getAnalyticsParamsFromSelection,
	type EventDateSelection,
} from "@/components/ui/event-date-filter";
import { getEventAnalytics } from "@/lib/api/dashboard";
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
		queryKey: ["event-analytics", event.id.toString(), "time-series", dateSelection],
		queryFn: () =>
			getEventAnalytics(event.id.toString(), {
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
				dateMode: analyticsParams.dateMode,
				groupBy: analyticsParams.groupBy,
			}),
	});

	// Prepare PDF report data
	const pdfReportData = prepareTicketReportData(
		{
			id: event.id.toString(),
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
	);

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
						disabled={ticketLoading}
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
