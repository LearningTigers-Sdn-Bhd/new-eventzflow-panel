"use client";

import {
	Activity,
	Clock,
	MapPin,
	Search,
	ShoppingBag,
	Stamp,
	TrendingUp,
} from "lucide-react";
import { BlankCard } from "@/components/admin-ui/analytic";
import type { EventAnalytics } from "@/lib/api/dashboard/response";
import type { MallLiveFeedResponse } from "@/lib/api/event/analytics/response";

interface EventDetailsQuickInfoProps {
	isTicketEvent: boolean;
	ticketAnalytics?: EventAnalytics;
	mallData?: MallLiveFeedResponse;
	redemptionRate: number;
	scanRate: number;
}

export function EventDetailsQuickInfo({
	isTicketEvent,
	ticketAnalytics,
	mallData,
	redemptionRate,
	scanRate,
}: EventDetailsQuickInfoProps) {
	if (isTicketEvent) {
		return (
			<div className="h-full">
				<BlankCard
					title="Quick Info"
					icon={<Search className="size-4" />}
					className="h-full"
				>
					<div className="flex h-full flex-col justify-between">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-muted-foreground">
									<MapPin className="size-4" />
									<span className="text-sm">Locations</span>
								</div>
								<span className="font-semibold">
									{ticketAnalytics?.locations ?? 0}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-muted-foreground">
									<Clock className="size-4" />
									<span className="text-sm">Pending Tickets</span>
								</div>
								<span className="font-semibold text-orange-600 dark:text-orange-400">
									{ticketAnalytics?.pendingTickets ?? 0}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-muted-foreground">
									<Activity className="size-4" />
									<span className="text-sm">Scan Rate</span>
								</div>
								<span className="font-semibold">{scanRate}%</span>
							</div>
						</div>
						<div className="mt-4">
							<div className="mb-2 text-muted-foreground text-sm">Progress</div>
							<div className="h-2 overflow-hidden rounded-none border border-emerald-500/50 bg-secondary">
								<div
									className="h-full bg-linear-to-r from-green-500 to-emerald-500 transition-all"
									style={{ width: `${scanRate}%` }}
								/>
							</div>
						</div>
					</div>
				</BlankCard>
			</div>
		);
	}
	// Visitor events
	return (
		<div className="h-full">
			<BlankCard
				title="Engagement Overview"
				icon={<Search className="size-4" />}
				className="h-full"
			>
				<div className="flex h-full flex-col justify-between">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-muted-foreground">
								<TrendingUp className="size-4" />
								<span className="text-sm">Redemption Rate</span>
							</div>
							<span className="font-semibold">
								{redemptionRate.toFixed(1)}%
							</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-muted-foreground">
								<Stamp className="size-4" />
								<span className="text-sm">Total Vouchers</span>
							</div>
							<span className="font-semibold">
								{mallData?.voucher_issuances ?? 0}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-muted-foreground">
								<ShoppingBag className="size-4" />
								<span className="text-sm">Redeemed</span>
							</div>
							<span className="font-semibold text-green-600 dark:text-green-400">
								{mallData?.voucher_redemptions ?? 0}
							</span>
						</div>
					</div>
					<div className="mt-4">
						<div className="mb-2 text-muted-foreground text-sm">
							Redemption Progress
						</div>
						<div className="h-2 overflow-hidden rounded-none border border-blue-500/50 bg-secondary">
							<div
								className="h-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all"
								style={{ width: `${Math.min(redemptionRate, 100)}%` }}
							/>
						</div>
					</div>
				</div>
			</BlankCard>
		</div>
	);
}
