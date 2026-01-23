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
import { getEventById } from "@/lib/api/event";

interface EventDetailsTicketStatsProps {
	eventId: string;
}

export function EventDetailsTicketStats({
	eventId,
}: EventDetailsTicketStatsProps) {
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
		enabled: !!event,
	});

	// Prepare PDF report data
	const pdfReportData = event
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
		: null;

	const isLoading = eventLoading || ticketLoading;

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
