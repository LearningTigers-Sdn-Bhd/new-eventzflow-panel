"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

// StatsCard Component
export type StatsCardProps = {
	label: string;
	value: React.ReactNode;
	Icon: React.ComponentType<{ className?: string }>;
	subtitle?: string;
	valueClassName?: string;
	iconContainerClassName?: string;
	iconClassName?: string;
};

export function StatsCard({ label, value, Icon, subtitle }: StatsCardProps) {
	return (
		<Card
			className={cn(
				"h-full rounded-none border border-border/90 border-x border-dashed bg-muted/50 p-0 shadow-none lg:border-l",
			)}
		>
			<CardContent className="h-full p-0">
				<div className="flex h-full flex-col items-center justify-between gap-2 md:flex-row md:gap-0">
					<div className="flex h-full items-center justify-center px-6 pt-3 md:py-0">
						<Icon className={cn("size-7 md:size-6")} />
					</div>
					<div className="flex h-full w-full flex-col justify-center px-4 pb-4 text-center md:px-0 md:py-4 md:text-left">
						<p className={cn("text-balance align-top font-semibold text-sm")}>
							{label}
						</p>
						<p className="font-bold text-xl tracking-tight">{value}</p>
						{subtitle && (
							<p className="text-muted-foreground text-sm">{subtitle}</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// WeeklyChart Component
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

// BlankCard Component
interface BlankCardProps {
	children: React.ReactNode;
	title?: string;
	icon?: React.ReactNode;
	className?: string;
}

export function BlankCard({
	children,
	title,
	icon,
	className,
}: BlankCardProps) {
	return (
		<Card
			className={cn(
				"gap-0 rounded-none border border-border/90 border-x border-dashed p-0 shadow-none lg:border-l",
				className,
			)}
		>
			{(title || icon) && (
				<CardHeader className="p-0">
					<div className="flex items-center gap-4">
						{icon && <div className="border-r border-dashed p-4">{icon}</div>}
						{title && (
							<div className="flex flex-col gap-1 px-2 py-3">
								<CardTitle className="text-sm">{title}</CardTitle>
							</div>
						)}
					</div>
				</CardHeader>
			)}
			<CardContent className="h-full bg-accent p-4">{children}</CardContent>
		</Card>
	);
}

// BlankCardWithButton Component
interface BlankCardWithButtonProps {
	children: React.ReactNode;
	title?: string;
	icon?: React.ReactNode;
	buttonLabel?: string;
	onButtonClick?: () => void;
	buttonIcon?: React.ReactNode;
	className?: string;
}

export function BlankCardWithButton({
	children,
	title,
	icon,
	buttonLabel,
	onButtonClick,
	buttonIcon,
	className,
}: BlankCardWithButtonProps) {
	return (
		<Card
			className={cn(
				"gap-0 rounded-none border border-border/90 border-x border-dashed p-0 shadow-none lg:border-l",
				className,
			)}
		>
			<CardHeader className="p-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						{icon && <div className="border-r border-dashed p-4">{icon}</div>}
						{title && (
							<div className="flex flex-col gap-1 px-2 py-3">
								<CardTitle className="text-sm">{title}</CardTitle>
							</div>
						)}
					</div>
					{buttonLabel && (
						<div className="flex items-center gap-2 px-2">
							<Button
								className="rounded-none border bg-accent"
								variant="outline"
								size="sm"
								onClick={onButtonClick}
							>
								{buttonIcon && <span className="mr-2">{buttonIcon}</span>}
								{buttonLabel}
							</Button>
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent className="bg-accent p-0">{children}</CardContent>
		</Card>
	);
}
