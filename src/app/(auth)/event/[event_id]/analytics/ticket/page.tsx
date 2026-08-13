"use client";

import { useQuery } from "@tanstack/react-query";
import {
	CheckCircle2,
	CircleDashed,
	Clock,
	DollarSign,
	Percent,
	QrCode,
	Ticket,
} from "lucide-react";
import { use, useMemo, useState } from "react";
import { StatsCard } from "@/components/admin-ui/analytic";
import { AnalyticsGraph } from "@/components/pages/analytics/analytics-graph";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getEventAnalytics } from "@/lib/api/dashboard";
import { getEventById } from "@/lib/api/event";
import { getHourlyBreakdownByDay } from "@/lib/api/event/analytics";

interface TicketAnalyticsPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function TicketAnalyticsPage({
	params,
}: TicketAnalyticsPageProps) {
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

	const { data, isLoading: analyticsLoading } = useQuery({
		queryKey: ["event", eventId, "analytics", dateSelection],
		queryFn: () =>
			getEventAnalytics(event_id, {
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
				dateMode: analyticsParams.dateMode,
				groupBy: analyticsParams.groupBy,
			}),
		enabled: !!event,
	});

	// Fetch hourly breakdown by day for all_time, pre_event, or event_duration filter
	// (works for single-day events too — just renders one day's bars)
	const shouldFetchHourlyBreakdown =
		dateSelection.type === "all_time" ||
		dateSelection.type === "pre_event" ||
		dateSelection.type === "event_duration";

	const { data: hourlyRegistrations } = useQuery({
		queryKey: ["event", eventId, "hourly_breakdown", "tickets", dateSelection],
		queryFn: () =>
			getHourlyBreakdownByDay(event_id, "tickets", {
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
			}),
		enabled: !!event && shouldFetchHourlyBreakdown,
	});

	const { data: hourlyScans } = useQuery({
		queryKey: ["event", eventId, "hourly_breakdown", "scans", dateSelection],
		queryFn: () =>
			getHourlyBreakdownByDay(event_id, "scans", {
				dateMode: analyticsParams.dateMode,
				startDate: analyticsParams.startDate,
				endDate: analyticsParams.endDate,
			}),
		enabled: !!event && shouldFetchHourlyBreakdown,
	});

	const isLoading = eventLoading || analyticsLoading;
	const checkInRate = data?.paidTickets
		? Math.round(((data.scannedTickets ?? 0) / data.paidTickets) * 1000) / 10
		: 0;

	// Generate date filter label for PDF filename
	const dateFilterLabel = useMemo(() => {
		return getDateFilterLabelFromSelection(dateSelection, event?.start_date);
	}, [dateSelection, event?.start_date]);

	// Prepare report data for PDF export (always full report, ignores filter)
	const reportData = useMemo(() => {
		if (!event || !data) return null;

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
				id: event_id,
				name: event.title,
				start_date: event.start_date,
				end_date: event.end_date,
			},
			{
				totalTickets: data.totalTickets ?? 0,
				paidTickets: data.paidTickets ?? 0,
				pendingTickets: data.pendingTickets ?? 0,
				scannedTickets: data.scannedTickets ?? 0,
				unscannedTickets: data.unscannedTickets ?? 0,
				totalRevenue: data.totalRevenue ?? 0,
				pendingRevenue: data.pendingRevenue ?? 0,
			},
			{
				registrations: data.registrationData,
				scans: data.scanData,
				revenue: data.revenueData,
			},
			hourlyBreakdown,
			dateFilterLabel,
		);
	}, [
		event,
		data,
		event_id,
		shouldFetchHourlyBreakdown,
		hourlyRegistrations,
		hourlyScans,
		dateFilterLabel,
	]);

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
							"paid-tickets",
							"pending-tickets",
							"check-in-rate",
							"scanned-tickets",
							"unscanned-tickets",
							"collected-revenue",
							"pending-revenue",
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
							label="Paid Tickets"
							value={data?.paidTickets?.toLocaleString() || "0"}
							Icon={DollarSign}
						/>
						<StatsCard
							label="Pending Tickets"
							value={data?.pendingTickets?.toLocaleString() || "0"}
							Icon={Clock}
						/>
						<StatsCard
							label="Check-in Rate"
							value={`${checkInRate}%`}
							Icon={Percent}
						/>
						<StatsCard
							label="Scanned Tickets"
							value={data?.scannedTickets?.toLocaleString() || "0"}
							Icon={QrCode}
						/>
						<StatsCard
							label="Unscanned Tickets"
							value={data?.unscannedTickets?.toLocaleString() || "0"}
							Icon={CircleDashed}
						/>
						<StatsCard
							label="Collected Revenue"
							value={formatCurrency(data?.totalRevenue)}
							Icon={CheckCircle2}
						/>
						<StatsCard
							label="Pending Revenue"
							value={formatCurrency(data?.pendingRevenue)}
							Icon={DollarSign}
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
