import {
	Activity,
	Calendar,
	MoveHorizontal,
	Scan,
	ShoppingBag,
	Store,
	Ticket,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
	type Indicator,
	ProgressStatsCard,
	StatsCard,
} from "@/components/admin-ui/analytic";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import { useIsTablet } from "@/hooks/use-tablet";
import type { AllEventsStats } from "@/lib/api/dashboard/response";

interface DashboardStatsProps {
	stats: AllEventsStats;
}

interface ProcessedStats extends AllEventsStats {
	avgLocationsPerEvent: string;
}

function MobileRenderStats({
	processedStats,
}: {
	processedStats: ProcessedStats;
}) {
	const router = useRouter();
	const cards = [
		// Events Card
		{
			id: "events",
			icon: Calendar,
			title: "Events",
			indicators: [
				{
					label: "Total",
					count: processedStats.totalEvents,
					color: "blue",
					isTotal: true,
				},
				{
					label: "Active",
					count: processedStats.activeEvents,
					color: "green",
				},
			] satisfies Indicator[],
			progressValue: processedStats.activeEvents,
			quickAction: {
				label: "View Events",
				onClick: () => {
					router.push("/event");
				},
			},
		},
		// Tickets Card
		{
			id: "tickets",
			icon: Ticket,
			title: "Tickets",
			subtitle: `${processedStats.ticketEvents} event${processedStats.ticketEvents !== 1 ? "s" : ""} with ticket system`,
			indicators: [
				{
					label: "Total",
					count: processedStats.totalTickets,
					color: "blue",
					isTotal: true,
				},
				{
					label: "Check-ins",
					count: processedStats.totalCheckins,
					color: "green",
				},
			] satisfies Indicator[],
			progressValue: processedStats.totalCheckins,
		},
		// Visitor Card
		{
			id: "visitor",
			icon: Users,
			title: "Visitor",
			subtitle: `${processedStats.nonTicketEvents} event${processedStats.nonTicketEvents !== 1 ? "s" : ""} with non ticket system`,
			indicators: [
				{
					label: "Total",
					count: processedStats.totalVisitors,
					color: "blue",
					isTotal: true,
				},
			] satisfies Indicator[],
		},
		// Voucher Card
		{
			id: "voucher",
			icon: ShoppingBag,
			title: "Voucher",
			indicators: [
				{
					label: "Total",
					count: processedStats.totalVouchers,
					color: "blue",
					isTotal: true,
				},
				{
					label: "Redeemed",
					count: processedStats.totalVouchersRedeemed,
					color: "green",
				},
			] satisfies Indicator[],
			progressValue: processedStats.totalVouchersRedeemed,
		},
		// Team Management Card
		{
			id: "team",
			icon: Store,
			title: "Team Management",
			subtitle:
				"Team members, and vendors count overview on your organization entry",
			indicators: [
				{
					label: "Vendor",
					count: processedStats.totalVendors,
					color: "blue",
				},
			] satisfies Indicator[],
		},
	];

	return (
		<div className="relative">
			<Carousel
				opts={{
					align: "start",
					loop: false,
					dragFree: true,
				}}
				className="w-full"
			>
				<CarouselContent className="-ml-4">
					{cards.map((card) => (
						<CarouselItem key={card.id} className="basis-[66.666%] pl-4">
							<ProgressStatsCard data={card} />
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-background via-background/80 to-transparent"
			/>
			<div className="mt-2 flex items-center justify-center gap-1 text-muted-foreground text-xs">
				<MoveHorizontal className="size-3.5" aria-hidden="true" />
				<span>Swipe to see more</span>
			</div>
		</div>
	);
}

function desktopRenderStats(processedStats: ProcessedStats) {
	return (
		<div className="space-y-4">
			{/* General Stats */}
			<div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
				<StatsCard
					label="Total Events"
					value={processedStats.totalEvents}
					subtitle={`${processedStats.activeEvents} active`}
					Icon={Calendar}
				/>
				<StatsCard
					label="Total Locations"
					value={processedStats.totalLocations}
					subtitle={`Avg ${processedStats.avgLocationsPerEvent} per event`}
					Icon={Activity}
				/>
				<StatsCard
					label="Total Tickets"
					value={processedStats.totalTickets.toLocaleString()}
					subtitle={`${processedStats.ticketEvents} ticket event${processedStats.ticketEvents !== 1 ? "s" : ""}`}
					Icon={Ticket}
				/>
				<StatsCard
					label="Total Check-Ins"
					value={processedStats.totalCheckins.toLocaleString()}
					subtitle="Across ticket events"
					Icon={Scan}
				/>
				<StatsCard
					label="Total Visitors"
					value={processedStats.totalVisitors.toLocaleString()}
					subtitle={`${processedStats.nonTicketEvents} non-ticket event${processedStats.nonTicketEvents !== 1 ? "s" : ""}`}
					Icon={Users}
				/>
				<StatsCard
					label="Total Vendors"
					value={processedStats.totalVendors.toLocaleString()}
					subtitle="Across all events"
					Icon={Store}
				/>
				<StatsCard
					label="Total Vouchers"
					value={processedStats.totalVouchers.toLocaleString()}
					subtitle="Across all events"
					Icon={Ticket}
				/>
				<StatsCard
					label="Vouchers Redeemed"
					value={processedStats.totalVouchersRedeemed.toLocaleString()}
					subtitle="Across all events"
					Icon={ShoppingBag}
				/>
			</div>
		</div>
	);
}

export function DashboardStats({ stats }: DashboardStatsProps) {
	const isTablet = useIsTablet();

	const avgLocationsPerEvent =
		stats.totalEvents > 0
			? (stats.totalLocations / stats.totalEvents).toFixed(1)
			: "0";

	const processedStats: ProcessedStats = {
		...stats,
		avgLocationsPerEvent,
	};

	return isTablet ? (
		<MobileRenderStats processedStats={processedStats} />
	) : (
		desktopRenderStats(processedStats)
	);
}
