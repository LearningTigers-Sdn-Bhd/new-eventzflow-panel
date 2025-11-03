import { DollarSign, QrCode, Ticket } from "lucide-react";
import { WeeklyChart } from "@/components/analytics-card";

interface AnalyticsGraphProps {
	weeklyRegisteredTickets?: { date: string; count: number }[];
	weeklyScannedTickets?: { date: string; count: number }[];
	weeklySalesAmount?: { date: string; count: number }[];
	isLoading?: boolean;
}

export function AnalyticsGraph({
	weeklyRegisteredTickets,
	weeklyScannedTickets,
	weeklySalesAmount,
	isLoading = false,
}: AnalyticsGraphProps) {
	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<WeeklyChart
				title="Weekly Registered Tickets"
				description="Ticket registrations over the last 7 days"
				data={weeklyRegisteredTickets}
				isLoading={isLoading}
				color="var(--chart-1)"
				icon={<Ticket className="h-4 w-4" />}
			/>
			<WeeklyChart
				title="Weekly Scanned Tickets"
				description="Ticket scans over the last 7 days"
				data={weeklyScannedTickets}
				isLoading={isLoading}
				color="var(--chart-2)"
				icon={<QrCode className="h-4 w-4" />}
			/>
			<WeeklyChart
				title="Weekly Sales Amount"
				description="Sales revenue over the last 7 days"
				data={weeklySalesAmount}
				isLoading={isLoading}
				color="var(--chart-3)"
				icon={<DollarSign className="h-4 w-4" />}
			/>
		</div>
	);
}
