"use client";

import { useQuery } from "@tanstack/react-query";
import {
	DollarSign,
	Percent,
	Receipt,
	Ticket,
	TrendingUp,
} from "lucide-react";
import { use, useMemo } from "react";
import { StatsCard } from "@/components/analytics-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getVoucherAnalytics } from "@/lib/api/voucher-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useAuth } from "@/hooks/use-auth";
import { getEventVendors } from "@/lib/api/event-vendor";

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
	const { data, isLoading } = useQuery({
		queryKey: ["voucher-analytics", eventId, currentUserVendorId],
		queryFn: () =>
			getVoucherAnalytics({
				event_id: eventId,
				vendor_id: currentUserVendorId,
			}),
		enabled: !Number.isNaN(eventId) && (!permissions.isEventVendor || !!currentUserVendorId),
	});

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
					<CardHeader>
						<CardTitle>Daily Redemption Trend</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-64 w-full" />
						) : data?.dailyRedemptionTrend && data.dailyRedemptionTrend.length > 0 ? (
							<ResponsiveContainer width="100%" height={350}>
								<AreaChart
									data={data.dailyRedemptionTrend}
									margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
								>
									<defs>
										<linearGradient id="colorRedemptions" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
											<stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
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
							<div className="flex h-64 items-center justify-center text-muted-foreground">
								No redemption data available
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
						) : data?.topScannedVouchers && data.topScannedVouchers.length > 0 ? (
							<div className="space-y-3">
								{data.topScannedVouchers.map((voucher, index) => (
									<div
										key={voucher.voucher_id}
										className="flex items-center justify-between border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
									>
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
												{index + 1}
											</div>
											<div className="min-w-0 flex-1">
												<p className="truncate font-semibold">{voucher.voucher_title}</p>
												{voucher.voucher_code && (
													<p className="text-xs text-muted-foreground">
														{voucher.voucher_code}
													</p>
												)}
											</div>
										</div>
										<div className="ml-4 flex-shrink-0 text-right">
											<p className="text-2xl font-bold">{voucher.redemption_count}</p>
											<p className="text-xs text-muted-foreground">scans</p>
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
													parseFloat(transaction.transaction_gross_amount),
												)}
											</TableCell>
											<TableCell className="text-right">
												{formatCurrency(
													parseFloat(transaction.discount_applied_value),
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

