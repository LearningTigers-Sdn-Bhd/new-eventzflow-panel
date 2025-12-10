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
		if (!amount) return "RM0.00";
		return new Intl.NumberFormat("ms-MY", {
			style: "currency",
			currency: "MYR",
		}).format(amount);
	};

	// Generate dynamic colors for any number of locations using HSL color space
	// Ensures visually distinct colors by distributing hues across the color wheel
	const generateColor = (index: number, total: number): string => {
		// Distribute hues evenly across the 360° color wheel
		const hue = (index * 360) / Math.max(total, 1);

		// Vary saturation and lightness slightly for better distinction
		const saturation = 70 + (index % 3) * 5; // 70-80%
		const lightness = 55 + (index % 2) * 5; // 55-60%

		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	};

	const locationTrafficData = useMemo(() => {
		// If no data, show placeholder data
		if (!data?.popular_halls || data.popular_halls.length === 0) {
			return [
				{
					name: "No Data",
					value: 1,
					percentage: "100.0",
					fill: "hsl(var(--muted))",
				},
			];
		}

		const total = data.popular_halls.length;

		// Backend already provides percentage, we just need to format it
		return data.popular_halls.map((hall, index) => ({
			name: hall.name,
			value: hall.percentage, // Use percentage as value for the pie chart
			percentage: hall.percentage.toFixed(1),
			fill: generateColor(index, total),
		}));
	}, [data?.popular_halls]);

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
							Most Popular Location
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-80 w-full" />
						) : (
							<div className="space-y-6">
								{/* Pie Chart - Clean without labels */}
								<div className="flex items-center justify-center">
									<ResponsiveContainer width="100%" height={280}>
										<PieChart>
											<Pie
												data={locationTrafficData}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={false}
												outerRadius={100}
												innerRadius={60}
												fill="#8884d8"
												dataKey="value"
												paddingAngle={3}
											>
												{locationTrafficData.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={entry.fill} />
												))}
											</Pie>
											{locationTrafficData[0]?.name !== "No Data" && (
												<Tooltip
													formatter={(value: number, name: string) => [
														`${value.toFixed(1)}%`,
														name,
													]}
												/>
											)}
										</PieChart>
									</ResponsiveContainer>
								</div>

								{/* Legend Below Chart */}
								{locationTrafficData[0]?.name === "No Data" ? (
									<div className="flex flex-col items-center justify-center space-y-2 pt-4">
										<p className="text-center text-muted-foreground text-sm">
											No location traffic data available yet
										</p>
										<p className="text-center text-muted-foreground text-xs">
											Data will appear once vendors are assigned to locations and visitors get stamped
										</p>
									</div>
								) : (
									<div className="space-y-4">
										{/* Legend - Capsule Design with Percentages */}
										<div className="flex flex-wrap items-center justify-center gap-3">
											{locationTrafficData.map((location, index) => (
												<div
													key={index}
													className="flex items-center gap-2 rounded-full px-3 py-1.5"
													style={{
														backgroundColor: `${location.fill}15`,
														border: `1.5px solid ${location.fill}`
													}}
												>
													<div
														className="size-2.5 rounded-full"
														style={{ backgroundColor: location.fill }}
													/>
													<span className="whitespace-nowrap font-medium text-sm">
														{location.name} ({location.percentage}%)
													</span>
												</div>
											))}
										</div>

										{/* Leading Location Message */}
										{locationTrafficData.length > 0 && (
											<p className="text-center text-muted-foreground text-sm">
												<span className="font-semibold text-foreground">
													{locationTrafficData[0].name}
												</span>{" "}
												leads current traffic.
											</p>
										)}
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
											<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-sm">
												{index + 1}
											</div>
											<div className="min-w-0 flex-1">
												<p className="truncate font-semibold">{merchant.name}</p>
											</div>
										</div>
										<div className="ml-4 flex-shrink-0 text-right">
											<p className="font-bold text-2xl">
												{merchant.count.toLocaleString()}
											</p>
											<p className="text-muted-foreground text-xs">visits</p>
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
