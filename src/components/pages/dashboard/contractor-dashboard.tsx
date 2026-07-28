"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Banknote,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	Store,
	Users,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { MdSpaceDashboard } from "react-icons/md";
import { StatsCard } from "@/components/admin-ui/analytic";
import { ErrorState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconTitle } from "@/components/ui/icon-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/auth/use-auth";
import { useFormatDate } from "@/hooks/use-format-date";
import { getContractorDashboard } from "@/lib/api/contractor-dashboard";
import type { ContractorEventData } from "@/lib/api/contractor-dashboard/response";
import { getEventStatusClass } from "@/lib/status-variants";
import { cn } from "@/lib/utils";

export function ContractorDashboard() {
	const { isInitialized, user } = useAuth();
	const router = useRouter();
	const { formatDate } = useFormatDate();

	const {
		data: dashboardData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["contractor-dashboard"],
		queryFn: getContractorDashboard,
		enabled: isInitialized,
	});

	if (!isInitialized || isLoading) {
		return <ContractorDashboardSkeleton />;
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
						title="Contractor Dashboard"
						description={`Welcome back, ${user?.full_name || "Contractor"}`}
					/>
				</div>
			</div>

			{/* Summary Stats */}
			{summary && (
				<div className="grid grid-cols-2 gap-1.5 p-2 sm:gap-2 sm:p-0 xl:grid-cols-3">
					<StatsCard
						label="Assigned Events"
						value={summary.total_events}
						subtitle={`${summary.active_events} active`}
						Icon={Calendar}
					/>
					<StatsCard
						label="Exhibitors"
						value={summary.total_exhibitors}
						subtitle="Across all events"
						Icon={Users}
					/>
					<StatsCard
						label="Booths"
						value={summary.total_booths}
						subtitle="Across all events"
						Icon={Store}
					/>
					<StatsCard
						label="Total Received"
						value={`RM ${summary.total_received_amount.toLocaleString()}`}
						subtitle="Verified payments"
						Icon={Banknote}
					/>
					<StatsCard
						label="Pending Payments"
						value={summary.pending_payments_count}
						subtitle="Awaiting verification"
						Icon={Clock}
					/>
					<StatsCard
						label="Verified Payments"
						value={summary.verified_payments_count}
						subtitle="Completed"
						Icon={CheckCircle2}
					/>
				</div>
			)}

			{/* Events List */}
			<div className="mt-4 border-t border-dashed pt-4 sm:mt-6 sm:pt-6">
				<div className="mb-3 px-3 sm:mb-4 sm:px-4">
					<IconTitle
						icon={Calendar}
						title="Your Events"
						description="Events you are assigned to as a contractor"
					/>
				</div>

				{events.length === 0 ? (
					<Card className="mx-3 rounded-none border-dashed sm:mx-4">
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
							<ContractorEventCard
								key={event.id}
								event={event}
								formatDate={formatDate}
								onViewDetails={() =>
									router.push(`/event/${event.id}/contractor-profile` as Route)
								}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

interface ContractorEventCardProps {
	event: ContractorEventData;
	formatDate: (date: string) => string;
	onViewDetails: () => void;
}

function ContractorEventCard({
	event,
	formatDate,
	onViewDetails,
}: ContractorEventCardProps) {
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
							getEventStatusClass(event.status),
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
				{/* Contractor Stats */}
				<div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 sm:gap-3 sm:p-4">
					<div className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2 text-center sm:flex-row sm:gap-2 sm:text-left">
						<Users className="size-4 text-muted-foreground sm:size-5" />
						<div>
							<p className="text-[10px] text-muted-foreground sm:text-xs">
								Exhibitors
							</p>
							<p className="font-bold text-base sm:text-lg">
								{event.exhibitors_count}
							</p>
						</div>
					</div>

					<div className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2 text-center sm:flex-row sm:gap-2 sm:text-left">
						<Store className="size-4 text-muted-foreground sm:size-5" />
						<div>
							<p className="text-[10px] text-muted-foreground sm:text-xs">
								Booths
							</p>
							<p className="font-bold text-base sm:text-lg">
								{event.booths_count}
							</p>
						</div>
					</div>

					<div className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2 text-center sm:flex-row sm:gap-2 sm:text-left">
						<Banknote className="size-4 text-muted-foreground sm:size-5" />
						<div>
							<p className="text-[10px] text-muted-foreground sm:text-xs">
								Received
							</p>
							<p className="font-bold text-base text-green-600 sm:text-lg dark:text-green-400">
								RM {event.total_received_amount.toLocaleString()}
							</p>
						</div>
					</div>

					<div className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2 text-center sm:flex-row sm:gap-2 sm:text-left">
						<Clock className="size-4 text-muted-foreground sm:size-5" />
						<div>
							<p className="text-[10px] text-muted-foreground sm:text-xs">
								Pending
							</p>
							<p className="font-bold text-base sm:text-lg">
								{event.pending_payments_count}
							</p>
						</div>
					</div>
				</div>

				{/* Payment Progress Bar */}
				<div className="border-t p-3 sm:p-4">
					<div className="flex items-center justify-between text-xs">
						<span className="text-muted-foreground">Payment Status</span>
						<span className="font-medium font-mono">
							{event.verified_payments_count} verified
						</span>
					</div>
					<div className="mt-2 h-1.5 overflow-hidden rounded-none bg-secondary">
						<div
							className="h-full bg-linear-to-r from-green-500 to-emerald-500 transition-all"
							style={{
								width: `${
									event.verified_payments_count + event.pending_payments_count >
									0
										? (
												event.verified_payments_count /
													(event.verified_payments_count +
														event.pending_payments_count)
											) * 100
										: 0
								}%`,
							}}
						/>
					</div>
					<p className="mt-1 text-right text-muted-foreground text-xs">
						{event.verified_payments_count} /{" "}
						{event.verified_payments_count + event.pending_payments_count}{" "}
						payments
					</p>
				</div>
			</CardContent>
		</Card>
	);
}

function ContractorDashboardSkeleton() {
	return (
		<div className="space-y-0">
			{/* Header */}
			<div className="page-header border-b border-dashed">
				<div className="px-3 sm:px-4">
					<Skeleton className="h-7 w-40 sm:h-8 sm:w-48" />
					<Skeleton className="mt-2 h-4 w-52 sm:w-64" />
				</div>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-2 gap-1.5 p-2 sm:gap-2 sm:p-0 xl:grid-cols-3">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div
						key={i}
						className="flex items-center justify-between rounded-none border border-dashed p-3 sm:p-4"
					>
						<div className="space-y-2">
							<Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
							<Skeleton className="h-6 w-12 sm:h-8 sm:w-16" />
							<Skeleton className="h-3 w-16 sm:w-20" />
						</div>
						<Skeleton className="h-8 w-8 shrink-0 rounded-md sm:h-10 sm:w-10" />
					</div>
				))}
			</div>

			{/* Events Section */}
			<div className="mt-4 border-t border-dashed pt-4 sm:mt-6 sm:pt-6">
				<div className="mb-3 px-3 sm:mb-4 sm:px-4">
					<Skeleton className="h-5 w-28 sm:h-6 sm:w-32" />
					<Skeleton className="mt-1 h-3 w-48 sm:w-56" />
				</div>
				<div className="grid gap-3 px-3 sm:gap-4 sm:px-4 lg:grid-cols-2">
					{[1, 2].map((i) => (
						<div key={i} className="rounded-none border border-dashed p-0">
							{/* Card Header */}
							<div className="space-y-3 p-3 sm:p-4">
								<div className="flex items-start justify-between gap-2">
									<Skeleton className="h-5 w-40 sm:h-6 sm:w-48" />
									<Skeleton className="h-8 w-16 shrink-0 rounded-none" />
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<Skeleton className="h-5 w-20 rounded-none" />
									<Skeleton className="h-3 w-32" />
								</div>
							</div>

							{/* Stats Grid */}
							<div className="grid grid-cols-2 gap-2 border-t p-3 sm:grid-cols-4 sm:gap-3 sm:p-4">
								{[1, 2, 3, 4].map((j) => (
									<div
										key={j}
										className="flex flex-col items-center gap-1 rounded-none border border-primary/20 bg-primary/5 p-2"
									>
										<Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
										<Skeleton className="h-2 w-12 sm:h-3" />
										<Skeleton className="h-5 w-10 sm:h-6 sm:w-12" />
									</div>
								))}
							</div>

							{/* Progress Bar */}
							<div className="border-t p-3 sm:p-4">
								<div className="flex items-center justify-between">
									<Skeleton className="h-3 w-24" />
									<Skeleton className="h-3 w-16" />
								</div>
								<Skeleton className="mt-2 h-1.5 w-full rounded-none" />
								<Skeleton className="mt-1 ml-auto h-3 w-20" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
