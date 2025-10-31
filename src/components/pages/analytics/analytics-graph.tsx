import { DollarSign, QrCode, Ticket } from "lucide-react";
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

interface WeeklyChartProps {
	title: string;
	description: string;
	data?: { date: string; count: number }[];
	isLoading?: boolean;
	color?: string;
	icon?: React.ReactNode;
}

export function WeeklyChart({
	title,
	description,
	data = [],
	isLoading = false,
	color = "var(--chart-1)",
	icon,
}: WeeklyChartProps) {
	const chartConfig = {
		count: {
			label: "Count",
			color: color,
		},
	} satisfies ChartConfig;

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("ms-MY", {
			month: "numeric",
			day: "numeric",
		});
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-[250px] w-full" />
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
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
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
									labelFormatter={(value) => {
										return new Date(value).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										});
									}}
									indicator="dot"
								/>
							}
						/>
						<Area
							dataKey="count"
							type="natural"
							fill={`url(#fill-${title.replace(/\s+/g, "-").toLowerCase()})`}
							stroke={color}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}

interface AnalyticsGraphProps {
	weeklyRegisteredTickets?: { date: string; count: number }[];
	weeklyScannedTickets?: { date: string; count: number }[];
	weeklySalesAmount?: { date: string; count: number }[];
	isLoading?: boolean;
}

export function AnalyticsGraph({
	weeklyRegisteredTickets,
	weeklyScannedTickets,
	weeklySalesAmount,
	isLoading = false,
}: AnalyticsGraphProps) {
	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<WeeklyChart
				title="Weekly Registered Tickets"
				description="Ticket registrations over the last 7 days"
				data={weeklyRegisteredTickets}
				isLoading={isLoading}
				color="var(--chart-1)"
				icon={<Ticket className="h-4 w-4" />}
			/>
			<WeeklyChart
				title="Weekly Scanned Tickets"
				description="Ticket scans over the last 7 days"
				data={weeklyScannedTickets}
				isLoading={isLoading}
				color="var(--chart-2)"
				icon={<QrCode className="h-4 w-4" />}
			/>
			<WeeklyChart
				title="Weekly Sales Amount"
				description="Sales revenue over the last 7 days"
				data={weeklySalesAmount}
				isLoading={isLoading}
				color="var(--chart-3)"
				icon={<DollarSign className="h-4 w-4" />}
			/>
		</div>
	);
}
