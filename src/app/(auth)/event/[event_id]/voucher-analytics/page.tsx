"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, Percent, Receipt, Ticket, TrendingUp } from "lucide-react";
import { use, useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { StatsCard } from "@/components/admin-ui/analytic";
import { FeatureLockedState } from "@/components/feature-locked-state";
import {
	ExportPdfButton,
	prepareVoucherReportData,
} from "@/components/pdf-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	EventDateFilter,
	type EventDateSelection,
	getAnalyticsParamsFromSelection,
} from "@/components/ui/event-date-filter";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/auth/use-auth";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { getEventById } from "@/lib/api/event";
import { getEventVendors } from "@/lib/api/event-vendor";
import { getVoucherAnalytics } from "@/lib/api/voucher-analytics";

interface VoucherAnalyticsPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function VoucherAnalyticsPage({
	params,
}: VoucherAnalyticsPageProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);
	const { user } = useAuth();
	const permissions = useEventPermissions(event_id);
	const [dateSelection, setDateSelection] = useState<EventDateSelection>({
		type: "event_duration",
	});

	// Fetch event to get start/end dates
	const { data: event, isLoading: eventLoading } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(event_id),
	});

	const analyticsParams = getAnalyticsParamsFromSelection(dateSelection);

	// Fetch event vendors to get the vendor_id for the current user if they're a vendor
	const { data: eventVendors } = useQuery({
		queryKey: ["events", eventId, "vendors"],
		queryFn: () => getEventVendors(eventId),
		enabled: !Number.isNaN(eventId) && permissions.isEventVendor,
	});

	// Get the current user's vendor_id if they're a vendor
	const currentUserVendorId = useMemo(() => {
		if (!permissions.isEventVendor || !user || !eventVendors) return undefined;
		const vendorRecord = eventVendors.find((v) => v.vendor_id === user.id);
		return vendorRecord?.vendor_id;
	}, [permissions.isEventVendor, user, eventVendors]);

	// Fetch voucher analytics with vendor_id filter for vendors
	const { data, isLoading: analyticsLoading } = useQuery({
		queryKey: [
			"voucher-analytics",
			eventId,
			currentUserVendorId,
			dateSelection,
		],
		queryFn: () =>
			getVoucherAnalytics({
				event_id: eventId,
				vendor_id: currentUserVendorId,
				start_date: analyticsParams.startDate,
				end_date: analyticsParams.endDate,
				group_by: analyticsParams.groupBy,
			}),
		enabled:
			!Number.isNaN(eventId) &&
			event?.use_voucher === true &&
			(!permissions.isEventVendor || !!currentUserVendorId) &&
			!!event,
	});

	const isLoading = eventLoading || analyticsLoading;

	const formatCurrency = (amount?: number) => {
		if (!amount) return "RM 0.00";
		return `RM ${amount.toFixed(2)}`;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Prepare report data for PDF export (always full report, ignores filter)
	const reportData = useMemo(() => {
		if (!event || !data) return null;
		return prepareVoucherReportData(
			{
				id: event_id,
				name: event.title,
				start_date: event.start_date,
				end_date: event.end_date,
			},
			{
				totalVouchersIssued: data.totalVouchersIssued ?? 0,
				totalRedemptions: data.totalRedemptions ?? 0,
				eventRedemptionRate: data.eventRedemptionRate ?? 0,
				totalDiscountValue: data.totalDiscountValue ?? 0,
				totalSales: data.totalSales ?? 0,
				dailyRedemptionTrend: data.dailyRedemptionTrend ?? [],
				topScannedVouchers: data.topScannedVouchers ?? [],
				latestRedemptionTransactions: data.latestRedemptionTransactions ?? [],
			},
		);
	}, [event, data, event_id]);

	if (Number.isNaN(eventId)) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="text-muted-foreground">Invalid event ID</p>
			</div>
		);
	}

	if (!eventLoading && event?.use_voucher !== true) {
		return (
			<FeatureLockedState
				isEventVendor={permissions.isEventVendor}
				featureName="Vouchers"
			/>
		);
	}

	return (
		<div className="space-y-4">
			{/* Stats Cards Section */}
			<div className="space-y-4">
				{isLoading ? (
					<div className="grid grid-cols-2 gap-2 rounded-none border-y border-dashed p-0 lg:grid-cols-5">
						{[
							"total-vouchers",
							"total-redemptions",
							"redemption-rate",
							"total-discount",
							"total-sales",
						].map((key) => (
							<div
								key={key}
								className="h-full rounded-none border border-border/90 border-x border-dashed bg-muted/50 p-0 shadow-none lg:border-l"
							>
								<div className="h-full p-0">
									<div className="flex h-full flex-col items-center justify-between gap-2 md:flex-row md:gap-0">
										<div className="flex h-full items-center justify-center px-6 pt-3 md:py-0">
											<Skeleton className="size-7 md:size-6" />
										</div>
										<div className="flex h-full w-full flex-col justify-center gap-1 px-4 pb-4 text-center md:px-0 md:py-4 md:text-left">
											<Skeleton className="h-4 w-20" />
											<Skeleton className="h-6 w-16" />
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-2 gap-2 rounded-none border-y border-dashed p-0 lg:grid-cols-5">
						<StatsCard
							label="Total Vouchers Issued"
							value={data?.totalVouchersIssued?.toLocaleString() || "0"}
							Icon={Ticket}
						/>
						<StatsCard
							label="Total Redemptions"
							value={data?.totalRedemptions?.toLocaleString() || "0"}
							Icon={Receipt}
						/>
						<StatsCard
							label="Redemption Rate"
							value={`${data?.eventRedemptionRate?.toFixed(1) || "0"}%`}
							Icon={Percent}
						/>
						<StatsCard
							label="Total Discount Value"
							value={formatCurrency(data?.totalDiscountValue)}
							Icon={DollarSign}
						/>
						<StatsCard
							label="Total Sales"
							value={formatCurrency(data?.totalSales)}
							Icon={TrendingUp}
						/>
					</div>
				)}
			</div>

			{/* Daily Redemption Trend Chart & Top Scanned Vouchers */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{/* Daily Redemption Trend Chart */}
				<Card className="rounded-none border-dashed lg:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>Redemption Trend</CardTitle>
						<div className="flex items-center gap-2">
							{event && (
								<EventDateFilter
									eventStartDate={event.start_date}
									eventEndDate={event.end_date}
									value={dateSelection}
									onChange={setDateSelection}
									hideAllTime
									hidePreEvent
								/>
							)}
							<ExportPdfButton data={reportData} disabled={isLoading} />
						</div>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-64 w-full" />
						) : data?.dailyRedemptionTrend &&
							data.dailyRedemptionTrend.length > 0 &&
							data.dailyRedemptionTrend.some((d) => d.count > 0) ? (
							<ResponsiveContainer width="100%" height={350}>
								<AreaChart
									data={data.dailyRedemptionTrend}
									margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
								>
									<defs>
										<linearGradient
											id="colorRedemptions"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
											<stop
												offset="95%"
												stopColor="#8884d8"
												stopOpacity={0.1}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
									<XAxis
										dataKey="date"
										tickFormatter={(value) => formatDate(value)}
										stroke="#888"
										style={{ fontSize: "12px" }}
									/>
									<YAxis
										stroke="#888"
										style={{ fontSize: "12px" }}
										allowDecimals={false}
									/>
									<Tooltip
										labelFormatter={(value) => formatDate(value as string)}
										contentStyle={{
											backgroundColor: "rgba(255, 255, 255, 0.95)",
											border: "1px solid #ccc",
											borderRadius: "8px",
											padding: "10px",
										}}
										formatter={(value: number) => [value, "Redemptions"]}
									/>
									<Legend
										wrapperStyle={{ paddingTop: "20px" }}
										iconType="circle"
									/>
									<Area
										type="monotone"
										dataKey="count"
										stroke="#8884d8"
										strokeWidth={2}
										fillOpacity={1}
										fill="url(#colorRedemptions)"
										name="Redemptions"
										animationDuration={1000}
									/>
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
								<TrendingUp className="h-8 w-8 opacity-50" />
								<p className="text-sm">No redemptions in this period</p>
								<p className="text-xs opacity-70">
									Try selecting a different time range
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Top Scanned Vouchers */}
				<Card className="rounded-none border-dashed">
					<CardHeader>
						<CardTitle>Top Scanned Vouchers</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-64 w-full" />
						) : data?.topScannedVouchers &&
							data.topScannedVouchers.length > 0 ? (
							<div className="space-y-3">
								{data.topScannedVouchers.map((voucher, index) => (
									<div
										key={voucher.voucher_id}
										className="flex items-center gap-3 border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
									>
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xs">
											{index + 1}
										</div>
										<div className="min-w-0 flex-1 overflow-hidden">
											<p
												className="truncate font-semibold text-sm"
												title={voucher.voucher_title}
											>
												{voucher.voucher_title}
											</p>
											<p className="truncate text-muted-foreground text-xs">
												{voucher.vendor_name || "Unknown Vendor"}
											</p>
										</div>
										<div className="shrink-0 text-right">
											<p className="font-bold text-lg">
												{voucher.redemption_count}
											</p>
											<p className="text-muted-foreground text-xs">scans</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex h-64 items-center justify-center text-muted-foreground">
								No voucher redemptions yet
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Latest Redemption Transactions */}
			<Card className="mb-12 rounded-none border-dashed">
				<CardHeader>
					<CardTitle>Latest Redemption Transactions</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Skeleton className="h-64 w-full" />
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Voucher Name</TableHead>
									<TableHead>Vendor</TableHead>
									<TableHead className="text-right">Original Value</TableHead>
									<TableHead className="text-right">Discount Applied</TableHead>
									<TableHead className="text-right">Timestamp</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data?.latestRedemptionTransactions &&
								data.latestRedemptionTransactions.length > 0 ? (
									data.latestRedemptionTransactions.map((transaction) => (
										<TableRow key={transaction.id}>
											<TableCell className="font-medium">
												{transaction.voucher_title}
											</TableCell>
											<TableCell>{transaction.vendor_name || "N/A"}</TableCell>
											<TableCell className="text-right">
												{formatCurrency(
													Number.parseFloat(
														transaction.transaction_gross_amount,
													),
												)}
											</TableCell>
											<TableCell className="text-right">
												{formatCurrency(
													Number.parseFloat(transaction.discount_applied_value),
												)}
											</TableCell>
											<TableCell className="text-right">
												{formatDateTime(transaction.redemption_timestamp)}
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={5}
											className="text-center text-muted-foreground"
										>
											No redemption transactions yet
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
