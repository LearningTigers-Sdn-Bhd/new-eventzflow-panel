import { DollarSign, QrCode, Ticket } from "lucide-react";
import { TimeSeriesChart } from "@/components/admin-ui/analytic";

interface AnalyticsGraphProps {
	registrationData?: { date: string; value: number }[];
	scanData?: { date: string; value: number }[];
	revenueData?: { date: string; value: number }[];
	isLoading?: boolean;
}

export function AnalyticsGraph({
	registrationData,
	scanData,
	revenueData,
	isLoading = false,
}: AnalyticsGraphProps) {
	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<TimeSeriesChart
				title="Ticket Registrations"
				description="Ticket registrations over time"
				data={registrationData}
				isLoading={isLoading}
				color="var(--chart-1)"
				icon={<Ticket className="h-4 w-4" />}
			/>
			<TimeSeriesChart
				title="Ticket Scans"
				description="Ticket scans over time"
				data={scanData}
				isLoading={isLoading}
				color="var(--chart-2)"
				icon={<QrCode className="h-4 w-4" />}
			/>
			<TimeSeriesChart
				title="Revenue"
				description="Sales revenue over time"
				data={revenueData}
				isLoading={isLoading}
				color="var(--chart-3)"
				icon={<DollarSign className="h-4 w-4" />}
			/>
		</div>
	);
}
