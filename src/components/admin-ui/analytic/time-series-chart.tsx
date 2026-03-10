"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeSeriesChartProps {
	title: string;
	description: string;
	data?: { date: string; value: number }[];
	isLoading?: boolean;
	color?: string;
	icon?: React.ReactNode;
	emptyMessage?: string;
}

export function TimeSeriesChart({
	title,
	description,
	data = [],
	isLoading = false,
	color = "var(--chart-1)",
	icon,
	emptyMessage,
}: TimeSeriesChartProps) {
	const chartConfig = {
		value: {
			label: "Value",
			color: color,
		},
	} satisfies ChartConfig;

	// Check if data is empty or all values are 0
	const hasData = data.length > 0 && data.some((d) => d.value > 0);

	// Detect if data is hourly (format: "2026-01-14 14:00") or daily (format: "2026-01-14")
	const isHourlyData = data.length > 0 && data[0]?.date?.includes(" ");

	const formatDate = (dateString: string) => {
		if (isHourlyData) {
			// Hourly format: "2026-01-14 14:00" -> "2PM"
			const timePart = dateString.split(" ")[1];
			if (timePart) {
				const [hourStr] = timePart.split(":");
				const hour = parseInt(hourStr, 10);
				if (hour === 0) return "12AM";
				if (hour === 12) return "12PM";
				if (hour < 12) return `${hour}AM`;
				return `${hour - 12}PM`;
			}
			return dateString;
		}
		// Daily format: show month/day
		const date = new Date(dateString);
		return date.toLocaleDateString("ms-MY", {
			month: "numeric",
			day: "numeric",
		});
	};

	const formatTooltipLabel = (dateString: string) => {
		if (isHourlyData) {
			// For hourly: "2026-01-14 14:00" -> "Jan 14, 2026 2:00 PM"
			const [datePart, timePart] = dateString.split(" ");
			const date = new Date(datePart);
			if (timePart) {
				const [hourStr, minStr] = timePart.split(":");
				const hour = parseInt(hourStr, 10);
				const ampm = hour >= 12 ? "PM" : "AM";
				const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
				return `${date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				})} ${hour12}:${minStr} ${ampm}`;
			}
			return `${date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})} ${timePart}`;
		}
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	if (isLoading) {
		return (
			<Card className="gap-0 rounded-none border border-border/90 border-x border-dashed p-0 shadow-none lg:border-l">
				<CardHeader className="flex items-center gap-4 p-0">
					<div className="h-full border-r border-dashed p-4">
						<div className="flex h-full items-center justify-center">
							<Skeleton className="h-4 w-4" />
						</div>
					</div>
					<div className="flex flex-col gap-1 px-2 py-3">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-3 w-32" />
					</div>
				</CardHeader>
				<CardContent className="flex flex-col items-center justify-center bg-accent p-0">
					<div className="h-[200px] w-full px-4 pb-4 pt-2">
						<Skeleton className="h-full w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="gap-0 rounded-none border border-border/90 border-x border-dashed p-0 shadow-none lg:border-l">
			<CardHeader className="flex items-center gap-4 p-0">
				<div className="h-full border-r border-dashed p-4">
					{icon && (
						<div className="flex h-full items-center justify-center">
							{icon}
						</div>
					)}
				</div>
				<div className="flex flex-col gap-1 px-2 py-3">
					<CardTitle className="text-sm">{title}</CardTitle>
					<CardDescription className="text-xs">{description}</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col items-center justify-center bg-accent p-0">
				{hasData ? (
					<ChartContainer config={chartConfig} className="h-[200px] w-full pt-2">
						<AreaChart
							accessibilityLayer
							data={data}
							margin={{
								left: -20,
								right: 30,
								top: 20,
								bottom: 5,
							}}
						>
							<defs>
								<linearGradient
									id={`fill-${title.replace(/\s+/g, "-").toLowerCase()}`}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop offset="5%" stopColor={color} stopOpacity={0.8} />
									<stop offset="95%" stopColor={color} stopOpacity={0.1} />
								</linearGradient>
							</defs>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="date"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								tickFormatter={formatDate}
								interval={isHourlyData ? 0 : "preserveStartEnd"}
								fontSize={isHourlyData ? 10 : 12}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								domain={[0, 'auto']}
								tickFormatter={(value) => {
									if (value >= 1000) {
										return `${(value / 1000).toFixed(1)}k`;
									}
									return value.toString();
								}}
							/>
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										labelFormatter={formatTooltipLabel}
										indicator="dot"
									/>
								}
							/>
							<Area
								dataKey="value"
								type="monotone"
								fill={`url(#fill-${title.replace(/\s+/g, "-").toLowerCase()})`}
								stroke={color}
								baseValue={0}
							/>
						</AreaChart>
					</ChartContainer>
				) : (
					<div className="flex h-[200px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
						<TrendingUp className="h-8 w-8 opacity-50" />
						<p className="text-sm">
							{emptyMessage || `No ${title.toLowerCase()} in this period`}
						</p>
						<p className="text-xs opacity-70">Try selecting a different time range</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
