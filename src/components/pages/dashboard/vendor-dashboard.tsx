"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Calendar,
	ChevronRight,
	ShoppingBag,
	Stamp,
	Ticket,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MdSpaceDashboard } from "react-icons/md";
import { StatsCard } from "@/components/admin-ui/analytic";
import { ErrorState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTitle } from "@/components/ui/icon-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormatDate } from "@/hooks/use-format-date";
import { useHydratedStore } from "@/hooks/use-hydrated-store";
import { getVendorDashboard } from "@/lib/api/vendor-dashboard";
import type { VendorEventData } from "@/lib/api/vendor-dashboard/response";
import { cn } from "@/lib/utils";
import { useUserSessionStore } from "@/stores/new-auth-store";

export function VendorDashboard() {
	const isHydrated = useHydratedStore();
	const router = useRouter();
	const { formatDate } = useFormatDate();
	const user = useUserSessionStore((state) => state.user);

	// Single optimized API call for all vendor dashboard data
	const {
		data: dashboardData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["vendor-dashboard"],
		queryFn: getVendorDashboard,
		enabled: isHydrated,
	});

	if (!isHydrated || isLoading) {
		return <VendorDashboardSkeleton />;
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load dashboard"
				description="We couldn't load your dashboard data. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	const { summary, events } = dashboardData || { summary: null, events: [] };

	return (
		<div className="space-y-0">
			{/* Header */}
			<div className="page-header border-b border-dashed">
				<div className="px-3 sm:px-4">
					<IconTitle
						icon={MdSpaceDashboard}
						title="Vendor Dashboard"
						description={`Welcome back, ${user?.full_name || "Vendor"}`}
					/>
				</div>
			</div>

			{/* Summary Stats - responsive grid */}
			{summary && (
				<div className="grid grid-cols-2 gap-1.5 p-2 sm:gap-2 sm:p-0 xl:grid-cols-4">
					<StatsCard
						label="Assigned Events"
						value={summary.total_events}
						subtitle={`${summary.active_events} active`}
						Icon={Calendar}
					/>
					<StatsCard
						label="Total Stamps"
						value={summary.total_stamps.toLocaleString()}
						subtitle="Across all events"
						Icon={Stamp}
					/>
					<StatsCard
						label="Total Vouchers"
						value={summary.total_vouchers.toLocaleString()}
						subtitle="Across all events"
						Icon={Ticket}
					/>
					<StatsCard
						label="Vouchers Redeemed"
						value={summary.total_redeemed.toLocaleString()}
						subtitle="Across all events"
						Icon={ShoppingBag}
					/>
				</div>
			)}

			{/* Events List */}
			<div className="mt-4 border-t border-dashed pt-4 sm:mt-6 sm:pt-6">
				<div className="mb-3 px-3 sm:mb-4 sm:px-4">
					<IconTitle
						icon={Calendar}
						title="Your Events"
						description="Events you are assigned to as a vendor"
					/>
				</div>

				{events.length === 0 ? (
					<Card className="mx-3 sm:mx-4">
						<CardContent className="p-8 text-center sm:p-12">
							<Calendar className="mx-auto mb-4 h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
							<h3 className="mb-2 font-semibold text-base sm:text-lg">
								No events assigned
							</h3>
							<p className="text-muted-foreground text-sm">
								You haven't been assigned to any events yet.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-3 px-3 sm:gap-4 sm:px-4 lg:grid-cols-2">
						{events.map((event) => (
							<VendorEventCard
								key={event.id}
								event={event}
								formatDate={formatDate}
								onViewDetails={() =>
									router.push(`/event/${event.id}/my-profile` as any)
								}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

// Vendor Event Card - displays pre-fetched analytics
interface VendorEventCardProps {
	event: VendorEventData;
	formatDate: (date: string) => string;
	onViewDetails: () => void;
}

function VendorEventCard({
	event,
	formatDate,
	onViewDetails,
}: VendorEventCardProps) {
	const isTicketEvent = event.use_ticket !== false;

	return (
		<Card className="group rounded-none border-dashed p-0 transition-all hover:border-primary/30 hover:border-solid hover:shadow-md">
			<CardHeader className="space-y-3 p-3 sm:p-4">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="line-clamp-2 text-base sm:text-lg">
						{event.title}
					</CardTitle>
					<Button
						variant="default"
						size="sm"
						onClick={onViewDetails}
						className="shrink-0 gap-1 rounded-none text-xs transition-shadow group-hover:shadow-md sm:text-sm"
					>
						View
						<ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5" />
					</Button>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Badge
						className={cn(
							"shrink-0 rounded-none text-xs capitalize",
							event.status === "published" && "bg-green-500 text-white",
							event.status === "draft" && "bg-yellow-500 text-white",
							event.status === "cancelled" && "bg-red-500 text-white",
							event.status === "completed" && "bg-blue-500 text-white",
						)}
					>
						{event.status}
					</Badge>
					<span className="text-muted-foreground text-xs">
						{formatDate(event.start_date)} - {formatDate(event.end_date)}
					</span>
				</div>
			</CardHeader>
			<CardContent className="border-t p-0">
				{/* Vendor Stats - optimized for mobile */}
				<div
					className={cn(
						"grid gap-2 p-3 sm:gap-3 sm:p-4",
						isTicketEvent ? "grid-cols-2" : "grid-cols-3",
					)}
				>
					{/* Stamp count - only for non-ticket events */}
					{!isTicketEvent && (
						<div className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2 text-center sm:flex-row sm:gap-2 sm:text-left">
							<Stamp className="size-4 text-muted-foreground sm:size-5" />
							<div>
								<p className="text-[10px] text-muted-foreground sm:text-xs">
									Your Stamps
								</p>
								<p className="font-bold text-base sm:text-lg">
									{event.stamp_count}
								</p>
							</div>
						</div>
					)}

					{/* Voucher stats */}
					<div className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2 text-center sm:flex-row sm:gap-2 sm:text-left">
						<Ticket className="size-4 text-muted-foreground sm:size-5" />
						<div>
							<p className="text-[10px] text-muted-foreground sm:text-xs">
								Vouchers
							</p>
							<p className="font-bold text-base sm:text-lg">
								{event.total_vouchers}
							</p>
						</div>
					</div>

					<div className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2 text-center sm:flex-row sm:gap-2 sm:text-left">
						<ShoppingBag className="size-4 text-muted-foreground sm:size-5" />
						<div>
							<p className="text-[10px] text-muted-foreground sm:text-xs">
								Redeemed
							</p>
							<p className="font-bold text-base text-green-600 sm:text-lg dark:text-green-400">
								{event.total_redeemed}
							</p>
						</div>
					</div>
				</div>

				{/* Redemption Rate Progress Bar */}
				<div className="border-t p-3 sm:p-4">
					<div className="flex items-center justify-between text-xs">
						<span className="text-muted-foreground">Redemption Rate</span>
						<span className="font-medium font-mono">
							{event.redemption_rate.toFixed(1)}%
						</span>
					</div>
					<div className="mt-2 h-1.5 overflow-hidden rounded-none bg-secondary">
						<div
							className="h-full bg-linear-to-r from-green-500 to-emerald-500 transition-all"
							style={{ width: `${Math.min(event.redemption_rate, 100)}%` }}
						/>
					</div>
					<p className="mt-1 text-right text-muted-foreground text-xs">
						{event.total_redeemed} / {event.total_vouchers} vouchers
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

function VendorDashboardSkeleton() {
	return (
		<div className="space-y-0">
			<div className="page-header border-b border-dashed">
				<div className="px-3 sm:px-4">
					<Skeleton className="h-7 w-40 sm:h-8 sm:w-48" />
					<Skeleton className="mt-2 h-4 w-52 sm:w-64" />
				</div>
			</div>
			<div className="grid grid-cols-2 gap-1.5 p-2 sm:gap-2 sm:p-0 xl:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="border p-3 sm:p-4">
						<Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
						<Skeleton className="mt-2 h-6 w-12 sm:h-8 sm:w-16" />
					</div>
				))}
			</div>
			<div className="mt-4 border-t border-dashed pt-4 sm:mt-6 sm:pt-6">
				<div className="mb-3 px-3 sm:mb-4 sm:px-4">
					<Skeleton className="h-5 w-28 sm:h-6 sm:w-32" />
				</div>
				<div className="grid gap-3 px-3 sm:gap-4 sm:px-4 lg:grid-cols-2">
					{[1, 2].map((i) => (
						<Skeleton key={i} className="h-44 w-full sm:h-48" />
					))}
				</div>
			</div>
		</div>
	);
}
