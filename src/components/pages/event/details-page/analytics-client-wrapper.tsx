"use client";

import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormatDate } from "@/hooks/use-format-date";
import type { EventAnalytics as EventAnalyticsType } from "@/lib/api/dashboard/response";
import type { MallLiveFeedResponse } from "@/lib/api/event/analytics/response";
import type { Event } from "@/lib/api/event/response";
import type { VoucherAnalyticsResponse } from "@/lib/api/voucher-analytics/response";

import { EventDetailsExhibitorStats } from "./event-details-exhibitor-stats";
import { EventDetailsKeyMetrics } from "./event-details-key-metrics";
import { EventDetailsQuickInfo } from "./event-details-quick-info";
import { EventDetailsRecentScans } from "./event-details-recent-scans";
import { EventDetailsTicketStats } from "./event-details-ticket-stats";
import { EventDetailsVisitorStats } from "./event-details-visitor-stats";

interface AnalyticsClientWrapperProps {
	event: Event;
	ticketAnalytics?: EventAnalyticsType;
	mallData?: MallLiveFeedResponse;
	voucherAnalytics?: VoucherAnalyticsResponse;
}

export function AnalyticsClientWrapper({
	event,
	ticketAnalytics,
	mallData,
	voucherAnalytics,
}: AnalyticsClientWrapperProps) {
	const { formatDate } = useFormatDate();
	const isTicketEvent = event.use_ticket !== false;

	// Calculate rates
	const scanRate =
		ticketAnalytics && ticketAnalytics.totalTickets > 0
			? Math.round(
					(ticketAnalytics.scannedTickets / ticketAnalytics.totalTickets) * 100,
				)
			: 0;
	const redemptionRate = mallData?.redemption_rate ?? 0;

	const formatCurrency = (amount?: number) => {
		if (!amount) return "RM0.00";
		return new Intl.NumberFormat("ms-MY", {
			style: "currency",
			currency: "MYR",
		}).format(amount);
	};

	return (
		<ResponsiveLayout>
			<MobileTabletView>
				<div className="space-y-6">
					{/* Analytics Tabs */}
					<Tabs defaultValue="key-metrics" className="rounded-none">
						<div className="relative w-full">
							{/* Left blur gradient */}
							<div className="pointer-events-none absolute top-0 -left-1 z-10 h-[90%] w-16 bg-linear-to-r from-foreground/20 via-muted/50 to-transparent opacity-30 blur-in-3xl" />
							{/* Right blur gradient */}
							<div className="pointer-events-none absolute top-0 -right-1 z-10 h-[90%] w-16 bg-linear-to-l from-foreground/20 via-muted/50 to-transparent opacity-30 blur-in-3xl" />
							<ScrollArea className="mx-auto w-full pb-2" scrollHideDelay={0}>
								<div className="w-full">
									<TabsList className="w-fit rounded-none border-2 px-1 py-6 *:px-8 *:py-5 sm:w-screen">
										<TabsTrigger value="key-metrics" className="rounded-none">
											Key Metrics
										</TabsTrigger>
										<TabsTrigger
											value="time-series-stats"
											className="rounded-none"
										>
											Analytics
										</TabsTrigger>
										<TabsTrigger value="quick-info" className="rounded-none">
											Quick Info
										</TabsTrigger>
										<TabsTrigger value="recent-scans" className="rounded-none">
											Recent Scans
										</TabsTrigger>
									</TabsList>
								</div>
								<ScrollBar orientation="horizontal" />
							</ScrollArea>
						</div>

						<TabsContent value="key-metrics" className="mt-2">
							<EventDetailsKeyMetrics
								isTicketEvent={isTicketEvent}
								ticketAnalytics={ticketAnalytics}
								mallData={mallData}
								formatCurrency={formatCurrency}
							/>
						</TabsContent>

						<TabsContent value="time-series-stats" className="mt-2">
							{isTicketEvent ? (
								<EventDetailsTicketStats event={event} />
							) : (
								<EventDetailsVisitorStats event={event} />
							)}
							{event.use_exhibitor_kit && (
								<EventDetailsExhibitorStats event={event} />
							)}
						</TabsContent>

						<TabsContent value="quick-info" className="mt-2">
							<EventDetailsQuickInfo
								isTicketEvent={isTicketEvent}
								ticketAnalytics={ticketAnalytics}
								mallData={mallData}
								redemptionRate={redemptionRate}
								scanRate={scanRate}
							/>
						</TabsContent>

						<TabsContent value="recent-scans" className="mt-2">
							<EventDetailsRecentScans
								isTicketEvent={isTicketEvent}
								ticketAnalytics={ticketAnalytics}
								voucherAnalytics={voucherAnalytics}
								eventId={event.id.toString()}
								formatDate={formatDate}
								formatCurrency={formatCurrency}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</MobileTabletView>
			<DesktopView>
				<div className="space-y-6">
					{/* Key Metrics */}
					<EventDetailsKeyMetrics
						isTicketEvent={isTicketEvent}
						ticketAnalytics={ticketAnalytics}
						mallData={mallData}
						formatCurrency={formatCurrency}
					/>

					{/* Analytics */}
					{isTicketEvent ? (
						<EventDetailsTicketStats event={event} />
					) : (
						<EventDetailsVisitorStats event={event} />
					)}
					{event.use_exhibitor_kit && (
						<>
							<EventDetailsExhibitorStats event={event} />
							<Separator />
						</>
					)}

					{/* Quick Info */}
					<div className="grid grid-cols-2 gap-2">
						<div className="col-span-1 h-full">
							<EventDetailsQuickInfo
								isTicketEvent={isTicketEvent}
								ticketAnalytics={ticketAnalytics}
								mallData={mallData}
								redemptionRate={redemptionRate}
								scanRate={scanRate}
							/>
						</div>
						{/* Recent Scans */}
						<div className="col-span-1 h-full">
							<EventDetailsRecentScans
								isTicketEvent={isTicketEvent}
								ticketAnalytics={ticketAnalytics}
								voucherAnalytics={voucherAnalytics}
								eventId={event.id.toString()}
								formatDate={formatDate}
								formatCurrency={formatCurrency}
							/>
						</div>
					</div>
				</div>
			</DesktopView>
		</ResponsiveLayout>
	);
}
