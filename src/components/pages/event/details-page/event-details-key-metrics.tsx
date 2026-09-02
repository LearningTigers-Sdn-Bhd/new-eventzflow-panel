"use client";

import {
	CircleDashed,
	Clock,
	DollarSign,
	Percent,
	QrCode,
	ShoppingBag,
	Ticket,
	TrendingUp,
	Users,
} from "lucide-react";
import { StatsCard } from "@/components/admin-ui/analytic";
import type { EventAnalytics } from "@/lib/api/dashboard/response";
import type { MallLiveFeedResponse } from "@/lib/api/event/analytics/response";

interface EventDetailsKeyMetricsProps {
	isTicketEvent: boolean;
	ticketAnalytics?: EventAnalytics;
	mallData?: MallLiveFeedResponse;
	formatCurrency: (amount?: number) => string;
}

export function EventDetailsKeyMetrics({
	isTicketEvent,
	ticketAnalytics,
	mallData,
	formatCurrency,
}: EventDetailsKeyMetricsProps) {
	// Rate must stay based on unique checked-in tickets (paid - unscanned), never
	// on scannedTickets directly — with multi-scan re-entries included, scannedTickets
	// can exceed paidTickets and would push the rate past 100%.
	const uniqueScannedTickets = ticketAnalytics
		? (ticketAnalytics.paidTickets ?? 0) -
			(ticketAnalytics.unscannedTickets ?? 0)
		: 0;
	const checkInRate = ticketAnalytics?.paidTickets
		? Math.round((uniqueScannedTickets / ticketAnalytics.paidTickets) * 1000) /
			10
		: 0;

	return (
		<div className="grid grid-cols-2 gap-2 border-y border-dashed lg:grid-cols-4">
			{isTicketEvent ? (
				<>
					<StatsCard
						label="Total Tickets"
						value={ticketAnalytics?.totalTickets ?? 0}
						Icon={Ticket}
					/>
					<StatsCard
						label="Paid Tickets"
						value={ticketAnalytics?.paidTickets ?? 0}
						Icon={DollarSign}
					/>
					<StatsCard
						label="Pending Tickets"
						value={ticketAnalytics?.pendingTickets ?? 0}
						Icon={Clock}
					/>
					<StatsCard
						label="Check-in Rate"
						value={`${checkInRate}%`}
						Icon={Percent}
					/>
					<StatsCard
						label="Scanned Tickets"
						value={ticketAnalytics?.scannedTickets ?? 0}
						Icon={QrCode}
					/>
					<StatsCard
						label="Unscanned Tickets"
						value={ticketAnalytics?.unscannedTickets ?? 0}
						Icon={CircleDashed}
					/>
					<StatsCard
						label="Collected Revenue"
						value={formatCurrency(ticketAnalytics?.totalRevenue) ?? "0"}
						Icon={TrendingUp}
					/>
					<StatsCard
						label="Pending Revenue"
						value={formatCurrency(ticketAnalytics?.pendingRevenue) ?? "0"}
						Icon={DollarSign}
					/>
				</>
			) : (
				<>
					<StatsCard
						label="Shoppers Today"
						value={mallData?.shoppers_registered_today ?? 0}
						Icon={Users}
					/>
					<StatsCard
						label="Estimated Sales"
						value={formatCurrency(mallData?.estimated_sales_today)}
						Icon={DollarSign}
					/>
					<StatsCard
						label="Voucher Issuances"
						value={mallData?.voucher_issuances ?? 0}
						Icon={Ticket}
					/>
					<StatsCard
						label="Voucher Redemptions"
						value={mallData?.voucher_redemptions ?? 0}
						Icon={ShoppingBag}
					/>
				</>
			)}
		</div>
	);
}
