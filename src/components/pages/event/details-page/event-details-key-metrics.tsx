"use client";

import {
	Clock,
	DollarSign,
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
						label="Scanned Tickets"
						value={ticketAnalytics?.scannedTickets ?? 0}
						Icon={QrCode}
					/>
					<StatsCard
						label="Unscanned Tickets"
						value={ticketAnalytics?.unscannedTickets ?? 0}
						Icon={Clock}
					/>
					<StatsCard
						label="Total Amount"
						value={ticketAnalytics?.totalRevenue.toLocaleString() ?? "0"}
						Icon={TrendingUp}
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
