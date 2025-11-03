"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, DollarSign, Ticket, XCircle } from "lucide-react";
import { use } from "react";
import { StatsCard } from "@/components/analytics-card";
import { AnalyticsGraph } from "@/components/pages/analytics/analytics-graph";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventAnalytics } from "@/lib/api/dashboard";

interface AnalyticsPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);

	// Single aggregated query to reduce network calls and token refreshes
	const { data, isLoading } = useQuery({
		queryKey: ["event", eventId, "analytics"],
		queryFn: () => getEventAnalytics(event_id),
	});

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
							"scanned-tickets",
							"unscanned-tickets",
							"total-amount",
						].map((key) => (
							<div
								key={key}
								className="rounded-none border border-border/90 border-x border-dashed bg-muted/50 p-0 shadow-none lg:border-l"
							>
								<div className="flex h-full flex-col items-center justify-between gap-2 p-6 md:flex-row md:gap-0">
									<Skeleton className="size-7 md:size-6" />
									<div className="flex w-full flex-col gap-2">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-6 w-16" />
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
							label="Scanned Tickets"
							value={data?.scannedTickets?.toLocaleString() || "0"}
							Icon={CheckCircle2}
						/>
						<StatsCard
							label="Unscanned Tickets"
							value={data?.unscannedTickets?.toLocaleString() || "0"}
							Icon={XCircle}
						/>
						<StatsCard
							label="Total Amount"
							value={formatCurrency(data?.totalRevenue)}
							Icon={DollarSign}
						/>
					</div>
				)}
			</div>

			{/* Charts Section */}
			<div className="mb-12 space-y-4 border-y border-dashed">
				<AnalyticsGraph
					weeklyRegisteredTickets={data?.registrationData?.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					weeklyScannedTickets={data?.scanData?.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					weeklySalesAmount={data?.revenueData?.map((d) => ({
						date: d.date,
						count: d.value,
					}))}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
}
