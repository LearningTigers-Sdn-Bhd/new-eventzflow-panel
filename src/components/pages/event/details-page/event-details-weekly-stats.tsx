"use client";

import { DollarSign, QrCode, Ticket } from "lucide-react";
import { WeeklyChart } from "@/components/admin-ui/analytic";
import type { EventAnalytics } from "@/lib/api/dashboard/response";

interface EventDetailsWeeklyStatsProps {
	isTicketEvent: boolean;
	ticketAnalytics?: EventAnalytics;
}

export function EventDetailsWeeklyStats({
	isTicketEvent,
	ticketAnalytics,
}: EventDetailsWeeklyStatsProps) {
	if (isTicketEvent) {
		return (
			<div className="mb-8 grid grid-cols-1 gap-4 border-y border-dashed lg:grid-cols-3">
				<WeeklyChart
					title="Weekly Registered Tickets"
					description="Ticket registrations over the last 7 days"
					data={ticketAnalytics?.registrationData.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					isLoading={false}
					color="var(--chart-1)"
					icon={<Ticket className="h-4 w-4" />}
				/>
				<WeeklyChart
					title="Weekly Scanned Tickets"
					description="Ticket scans over the last 7 days"
					data={ticketAnalytics?.scanData.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					isLoading={false}
					color="var(--chart-2)"
					icon={<QrCode className="h-4 w-4" />}
				/>
				<WeeklyChart
					title="Weekly Sales Amount"
					description="Sales revenue over the last 7 days"
					data={ticketAnalytics?.revenueData.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					isLoading={false}
					color="var(--chart-3)"
					icon={<DollarSign className="h-4 w-4" />}
				/>
			</div>
		);
	}
	// Visitor events - placeholder/empty state
	// return (
	// 	<div className="mb-8 flex h-64 items-center justify-center border-y border-dashed">
	// 		<div className="text-center text-muted-foreground">
	// 			<Activity className="mx-auto mb-2 h-12 w-12 opacity-50" />
	// 			<p className="text-sm">
	// 				Weekly stats not available for visitor events
	// 			</p>
	// 		</div>
	// 	</div>
	// );
	return null;
}
