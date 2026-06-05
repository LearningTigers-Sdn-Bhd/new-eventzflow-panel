"use client";

import { PieChart as PieChartIcon } from "lucide-react";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PieChartData {
	label: string;
	value: number;
	color?: string;
}

interface PieChartCardProps {
	title: string;
	description: string;
	data?: PieChartData[];
	isLoading?: boolean;
	icon?: React.ReactNode;
	emptyMessage?: string;
}

// Default colors for pie chart slices
const DEFAULT_COLORS = [
	"hsl(var(--chart-1))",
	"hsl(var(--chart-2))",
	"hsl(var(--chart-3))",
	"hsl(var(--chart-4))",
	"hsl(var(--chart-5))",
	"hsl(221.2 83.2% 53.3%)", // blue
	"hsl(142.1 76.2% 36.3%)", // green
	"hsl(47.9 95.8% 53.1%)", // yellow
	"hsl(346.8 77.2% 49.8%)", // red
	"hsl(262.1 83.3% 57.8%)", // purple
];

export function PieChartCard({
	title,
	description,
	data = [],
	isLoading = false,
	icon,
	emptyMessage,
}: PieChartCardProps) {
	// Check if data is empty or all values are 0
	const hasData = data.length > 0 && data.some((d) => d.value > 0);

	// Prepare data with colors
	const chartData = data.map((item, index) => ({
		name: item.label,
		value: item.value,
		color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
	}));

	// Custom tooltip
	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="rounded-lg border bg-background p-2 shadow-md">
					<p className="font-medium text-sm">{payload[0].name}</p>
					<p className="text-muted-foreground text-sm">
						Count: {payload[0].value}
					</p>
				</div>
			);
		}
		return null;
	};

	// Custom legend
	const CustomLegend = ({ payload }: any) => {
		return (
			<div className="mt-4 grid grid-cols-1 gap-2 text-sm">
				{payload.map((entry: any, index: number) => (
					<div key={`legend-${index}`} className="flex items-center gap-2">
						<div
							className="h-3 w-3 rounded-full"
							style={{ backgroundColor: entry.color }}
						/>
						<span className="truncate text-muted-foreground text-xs">
							{entry.value}: {entry.payload.value}
						</span>
					</div>
				))}
			</div>
		);
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
					<div className="h-[300px] w-full px-4 pt-2 pb-4">
						<Skeleton className="h-full w-full rounded-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="gap-0 rounded-none border border-border/90 border-x border-dashed p-0 shadow-none lg:border-l">
			<CardHeader className="flex items-center gap-4 p-0">
				<div className="h-full border-r border-dashed p-4">
					{icon ? (
						<div className="flex h-full items-center justify-center">
							{icon}
						</div>
					) : null}
				</div>
				<div className="flex flex-col gap-1 px-2 py-3">
					<CardTitle className="text-sm">{title}</CardTitle>
					<CardDescription className="text-xs">{description}</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col items-center justify-center bg-accent p-0">
				{hasData ? (
					<div className="h-[300px] w-full px-4 py-2">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={chartData}
									cx="50%"
									cy="40%"
									labelLine={false}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
								>
									{chartData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip content={<CustomTooltip />} />
								<Legend content={<CustomLegend />} />
							</PieChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className="flex h-[300px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
						<PieChartIcon className="h-8 w-8 opacity-50" />
						<p className="text-sm">
							{emptyMessage || `No ${title.toLowerCase()} available`}
						</p>
						<p className="text-xs opacity-70">
							Data will appear when available
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
