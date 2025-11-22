"use client";

import { useQuery } from "@tanstack/react-query";
import {
	DollarSign,
	MapPin,
	ShoppingBag,
	Ticket,
	TrendingUp,
	Users,
} from "lucide-react";
import { use, useMemo } from "react";
import { StatsCard } from "@/components/analytics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMallLiveFeed } from "@/lib/api/event/analytics";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

interface MallLiveFeedPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default function MallLiveFeedPage({ params }: MallLiveFeedPageProps) {
	const { event_id } = use(params);
	const eventId = Number.parseInt(event_id, 10);

	const { data, isLoading } = useQuery({
		queryKey: ["event", eventId, "mall-live-feed"],
		queryFn: () => getMallLiveFeed({ id: eventId }),
		refetchInterval: 30000, // Refresh every 30 seconds for live data
	});

	const formatCurrency = (amount?: number) => {
		if (!amount) return "$0.00";
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	// Prepare pie chart data with colors
	const COLORS = [
		"hsl(var(--chart-1))",
		"hsl(var(--chart-2))",
		"hsl(var(--chart-3))",
		"hsl(var(--chart-4))",
		"hsl(var(--chart-5))",
	];

	const locationTrafficData = useMemo(() => {
		// If no data, show placeholder data
		if (!data?.location_traffic || data.location_traffic.length === 0) {
			return [
				{
					name: "No Data",
					value: 1,
					percentage: "100.0",
					fill: "hsl(var(--muted))",
				},
			];
		}

		const totalTraffic = data.location_traffic.reduce(
			(sum, loc) => sum + loc.count,
			0,
		);

		return data.location_traffic.map((location, index) => ({
			name: location.name,
			value: location.count,
			percentage:
				totalTraffic > 0
					? ((location.count / totalTraffic) * 100).toFixed(1)
					: "0.0",
			fill: COLORS[index % COLORS.length],
		}));
	}, [data?.location_traffic]);

	if (Number.isNaN(eventId)) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="text-muted-foreground">Invalid event ID</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Today's Stats Section */}
			<div className="space-y-4">
				{isLoading ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{["shoppers", "sales"].map((key) => (
							<div
								key={key}
								className="rounded-lg border border-border bg-card p-6"
							>
								<div className="flex items-center justify-between">
									<Skeleton className="size-8" />
									<div className="flex flex-col gap-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-8 w-24" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<StatsCard
							label="Shoppers Registered Today"
							value={data?.shoppers_registered_today?.toLocaleString() || "0"}
							Icon={Users}
						/>
						<StatsCard
							label="Estimated Sales Today"
							value={formatCurrency(data?.estimated_sales_today)}
							Icon={DollarSign}
						/>
					</div>
				)}
			</div>

			{/* Voucher Stats Section */}
			<div className="space-y-4">
				{isLoading ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{["issuances", "redemptions", "rate"].map((key) => (
							<div
								key={key}
								className="rounded-lg border border-border bg-card p-6"
							>
								<div className="flex items-center justify-between">
									<Skeleton className="size-8" />
									<div className="flex flex-col gap-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-8 w-24" />
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<StatsCard
							label="Total Voucher Issuances"
							value={data?.voucher_issuances?.toLocaleString() || "0"}
							Icon={Ticket}
						/>
						<StatsCard
							label="Total Voucher Redemptions"
							value={data?.voucher_redemptions?.toLocaleString() || "0"}
							Icon={ShoppingBag}
						/>
						<StatsCard
							label="Redemption Rate"
							value={`${data?.redemption_rate?.toFixed(1) || "0.0"}%`}
							Icon={TrendingUp}
						/>
					</div>
				)}
			</div>

			{/* Location Traffic & Top Merchants Section */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{/* Location Traffic Pie Chart */}
				<Card className="rounded-none border-dashed">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="size-5" />
							Hall/Section Traffic Distribution
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-80 w-full" />
						) : (
							<div className="space-y-4">
								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={locationTrafficData}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={
												locationTrafficData[0]?.name === "No Data"
													? false
													: ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
															const RADIAN = Math.PI / 180;
															const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
															const x = cx + radius * Math.cos(-midAngle * RADIAN);
															const y = cy + radius * Math.sin(-midAngle * RADIAN);

															return (
																<text
																	x={x}
																	y={y}
																	fill="white"
																	textAnchor={x > cx ? "start" : "end"}
																	dominantBaseline="central"
																	className="font-bold text-lg"
																>
																	{`${percentage}%`}
																</text>
															);
													  }
											}
											outerRadius={120}
											innerRadius={70}
											fill="#8884d8"
											dataKey="value"
											paddingAngle={2}
										>
											{locationTrafficData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.fill} />
											))}
										</Pie>
										{locationTrafficData[0]?.name !== "No Data" && (
											<Tooltip
												formatter={(value: number) => [
													`${value.toLocaleString()} visits`,
													"Traffic",
												]}
											/>
										)}
									</PieChart>
								</ResponsiveContainer>
								{locationTrafficData[0]?.name === "No Data" ? (
									<div className="flex flex-col items-center justify-center space-y-2 border-t pt-4">
										<p className="text-center text-sm text-muted-foreground">
											No location traffic data available yet
										</p>
										<p className="text-center text-xs text-muted-foreground">
											Data will appear once visitors start checking in at different
											locations
										</p>
									</div>
								) : (
									<div className="space-y-2 border-t pt-4">
										{locationTrafficData.map((location, index) => (
											<div
												key={index}
												className="flex items-center justify-between text-sm"
											>
												<div className="flex items-center gap-2">
													<div
														className="size-3 rounded-full"
														style={{ backgroundColor: location.fill }}
													/>
													<span className="font-medium">{location.name}</span>
												</div>
												<div className="flex items-center gap-3">
													<span className="text-muted-foreground">
														{location.value.toLocaleString()} visits
													</span>
													<span className="font-semibold">
														{location.percentage}%
													</span>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Top Merchants Section */}
				<Card className="rounded-none border-dashed">
					<CardHeader>
						<CardTitle>Top 5 Merchants by Visits</CardTitle>
					</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3, 4, 5].map((i) => (
								<Skeleton key={i} className="h-20 w-full" />
							))}
						</div>
					) : data?.top_merchants && data.top_merchants.length > 0 ? (
						<div className="space-y-3">
							{data.top_merchants.map(
								(
									merchant: { name: string; count: number },
									index: number,
								) => (
									<div
										key={`${merchant.name}-${index}`}
										className="flex items-center justify-between border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
									>
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
												{index + 1}
											</div>
											<div className="min-w-0 flex-1">
												<p className="truncate font-semibold">{merchant.name}</p>
											</div>
										</div>
										<div className="ml-4 flex-shrink-0 text-right">
											<p className="text-2xl font-bold">
												{merchant.count.toLocaleString()}
											</p>
											<p className="text-xs text-muted-foreground">visits</p>
										</div>
									</div>
								),
							)}
						</div>
					) : (
						<div className="flex h-64 items-center justify-center text-muted-foreground">
							No merchant data available
						</div>
					)}
				</CardContent>
			</Card>
			</div>
		</div>
	);
}
