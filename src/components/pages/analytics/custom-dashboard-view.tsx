"use client";

import { useQuery } from "@tanstack/react-query";
import {
	BarChart3,
	CalendarClock,
	LayoutDashboard,
	TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReportLanguage } from "@/hooks/use-report-language";
import type {
	CustomFieldBreakdownGroup,
	CustomFieldBreakdownRow,
} from "@/lib/api/event/analytics";
import { getTimeSeries } from "@/lib/api/event/analytics";
import { cn } from "@/lib/utils";
import type { CustomFieldBreakdownChange } from "./custom-field-breakdown-card";
import { humanizeFieldKey } from "./custom-field-breakdown-card";
import { ReportSection } from "./report-section";

const chartColor = (index: number) => `var(--chart-${(index % 5) + 1})`;

interface SliceDatum {
	name: string;
	value: number;
}

interface BreakdownChartProps {
	title: string;
	rows: CustomFieldBreakdownRow[];
	isLoading: boolean;
	emptyMessage?: string;
	showDonut?: boolean;
}

function BreakdownChart({
	title,
	rows,
	isLoading,
	emptyMessage,
	showDonut = false,
}: BreakdownChartProps) {
	const { labels, language } = useReportLanguage();
	const [expanded, setExpanded] = useState(false);
	const data = useMemo<SliceDatum[]>(
		() =>
			rows
				.filter((row) => row.count > 0)
				.map((row) => ({ name: row.value, value: row.count }))
				.sort((a, b) => b.value - a.value),
		[rows],
	);
	const total = data.reduce((sum, d) => sum + d.value, 0);

	if (isLoading) {
		return (
			<div className="border">
				<div className="border-b px-3 py-2">
					<Skeleton className="h-4 w-40" />
				</div>
				<Skeleton className="m-4 h-52" />
			</div>
		);
	}

	if (!data.length) {
		return (
			<div className="border">
				<div className="border-b px-3 py-2">
					<p className="font-medium text-sm">{title}</p>
				</div>
				<p className="py-10 text-center text-muted-foreground text-sm">
					{emptyMessage ?? labels.noDataAvailable}
				</p>
			</div>
		);
	}

	// Keep long names in normal document flow, never inside a fixed SVG axis.
	const visibleData = expanded ? data : data.slice(0, 10);

	return (
		<section className="min-w-0 overflow-hidden rounded-none border bg-background">
			<div className="space-y-3 border-b p-4 sm:p-5">
				<h3 className="break-words font-semibold text-sm leading-relaxed">
					{title}
				</h3>
				<div className="flex items-baseline gap-2">
					<span className="font-semibold text-2xl tabular-nums tracking-tight">
						{total.toLocaleString()}
					</span>
					<span className="text-muted-foreground text-xs">{labels.total}</span>
				</div>
			</div>
			<div className="space-y-4 p-4 sm:p-5">
				{showDonut && (
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={data}
									dataKey="value"
									nameKey="name"
									innerRadius="45%"
									outerRadius="75%"
									paddingAngle={2}
								>
									{data.map((entry, index) => (
										<Cell key={entry.name} fill={chartColor(index)} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</div>
				)}
				<ol className="space-y-4">
					{visibleData.map((entry, index) => (
						<li key={entry.name} className="space-y-2">
							<div className="flex items-start gap-3 text-sm">
								<span className="w-5 shrink-0 pt-0.5 text-muted-foreground text-xs tabular-nums">
									{index + 1}
								</span>
								<span className="min-w-0 flex-1 break-words leading-relaxed">
									{entry.name}
								</span>
								<span className="shrink-0 text-right tabular-nums">
									<span className="block font-semibold">
										{entry.value.toLocaleString()}
									</span>
									<span className="text-muted-foreground text-xs">
										{((entry.value / total) * 100).toFixed(1)}%
									</span>
								</span>
							</div>
							<div
								aria-hidden="true"
								className="ml-8 h-1.5 overflow-hidden rounded-none bg-muted"
							>
								<div
									className="h-full rounded-none"
									style={{
										width: `${(entry.value / total) * 100}%`,
										backgroundColor: showDonut
											? chartColor(index)
											: "var(--chart-1)",
									}}
								/>
							</div>
						</li>
					))}
				</ol>
				{data.length > 10 && (
					<Button
						type="button"
						variant="outline"
						className="min-h-11 w-full rounded-none"
						aria-expanded={expanded}
						onClick={() => setExpanded(!expanded)}
					>
						{expanded
							? language === "bm"
								? "Tunjuk 10 teratas"
								: "Show top 10"
							: `${labels.show} ${labels.allSelected} (${data.length.toLocaleString()})`}
					</Button>
				)}
			</div>
		</section>
	);
}

interface GroupDonutGridProps {
	groupLabel: string;
	fieldLabel: string;
	groups: CustomFieldBreakdownGroup[];
	isLoading: boolean;
}

function GroupDonutGrid({
	groupLabel,
	fieldLabel,
	groups,
	isLoading,
}: GroupDonutGridProps) {
	const { labels } = useReportLanguage();

	if (isLoading) {
		return (
			<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,28rem),1fr))] items-start gap-4">
				{["a", "b", "c"].map((id) => (
					<Skeleton key={id} className="h-64" />
				))}
			</div>
		);
	}

	if (!groups.length) {
		return (
			<p className="py-10 text-center text-muted-foreground text-sm">
				{labels.noDataAvailable}
			</p>
		);
	}

	return (
		<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,28rem),1fr))] items-start gap-4">
			{groups.map((group) => (
				<BreakdownChart
					key={group.group}
					title={`${groupLabel}: ${group.group} — ${fieldLabel}`}
					rows={group.rows}
					isLoading={false}
					showDonut={false}
				/>
			))}
		</div>
	);
}

interface CustomDashboardViewProps {
	eventId: string;
	ticketTypeRows: CustomFieldBreakdownRow[] | null;
	ticketTypeLoading: boolean;
	customField: CustomFieldBreakdownChange;
	customFieldLoading: boolean;
}

/**
 * Chart-first companion to the Custom Reports tables: same data sources
 * (ticket type + custom field breakdowns, driven by the same "show count /
 * split by" selectors on the report page), rendered as overview stat tiles,
 * ranked breakdowns per split group and a registrations time-series.
 */
export function CustomDashboardView({
	eventId,
	ticketTypeRows,
	ticketTypeLoading,
	customField,
	customFieldLoading,
}: CustomDashboardViewProps) {
	const { labels } = useReportLanguage();

	const [trendGroupBy, setTrendGroupBy] = useState<"day" | "week" | "month">(
		"day",
	);

	const nested = customField && "groupBy" in customField ? customField : null;
	const flat = customField && !("groupBy" in customField) ? customField : null;

	const allGroupNames = useMemo(
		() => nested?.groups.map((g) => g.group) ?? [],
		[nested],
	);
	// Compute each group's subtotal once — the onDataChange payload from the
	// selector card omits the API's `total` field, and every group view
	// (overview tiles, grouped breakdowns) needs it.
	const nestedGroups = useMemo<CustomFieldBreakdownGroup[]>(
		() =>
			(nested?.groups ?? []).map((g) => ({
				group: g.group,
				rows: g.rows,
				total: g.rows.reduce((sum, row) => sum + row.count, 0),
			})),
		[nested],
	);

	const totalTickets = useMemo(
		() => ticketTypeRows?.reduce((sum, row) => sum + row.count, 0) ?? null,
		[ticketTypeRows],
	);
	const customFieldTotal = useMemo(() => {
		if (flat) return flat.rows.reduce((sum, row) => sum + row.count, 0);
		if (nested)
			return nested.groups.reduce((sum, group) => {
				return sum + group.rows.reduce((rowSum, row) => rowSum + row.count, 0);
			}, 0);
		return null;
	}, [flat, nested]);

	const { data: trend, isLoading: trendLoading } = useQuery({
		queryKey: ["event", eventId, "dashboard_trend", trendGroupBy],
		queryFn: () =>
			getTimeSeries({
				eventId: Number.parseInt(eventId, 10),
				metric: "tickets",
				groupBy: trendGroupBy,
				dateMode: "all_time",
			}),
	});

	return (
		<div className="space-y-4">
			{/* Overview tiles */}
			<ReportSection icon={LayoutDashboard} title={labels.overview}>
				<div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
					<div className="border bg-muted/50 p-4">
						<p className="text-muted-foreground text-xs">
							{labels.totalTickets}
						</p>
						{ticketTypeLoading ? (
							<Skeleton className="mt-1 h-8 w-20" />
						) : (
							<p className="font-bold text-3xl tracking-tight">
								{(totalTickets ?? 0).toLocaleString()}
							</p>
						)}
					</div>
					<div className="border bg-muted/50 p-4">
						<p className="text-muted-foreground text-xs">
							{labels.distinct} {labels.ticketType}
						</p>
						{ticketTypeLoading ? (
							<Skeleton className="mt-1 h-8 w-12" />
						) : (
							<p className="font-bold text-3xl tracking-tight">
								{(ticketTypeRows?.length ?? 0).toLocaleString()}
							</p>
						)}
					</div>
					{customField && (
						<>
							<div className="border bg-muted/50 p-4">
								<p className="truncate text-muted-foreground text-xs">
									{labels.distinct} {humanizeFieldKey(customField.fieldKey)}
								</p>
								<p className="font-bold text-3xl tracking-tight">
									{(nested
										? allGroupNames.length
										: (flat?.rows.length ?? 0)
									).toLocaleString()}
								</p>
							</div>
							<div className="border bg-muted/50 p-4">
								<p className="truncate text-muted-foreground text-xs">
									{labels.total} — {humanizeFieldKey(customField.fieldKey)}
								</p>
								<p className="font-bold text-3xl tracking-tight">
									{(customFieldTotal ?? 0).toLocaleString()}
								</p>
							</div>
						</>
					)}
				</div>
			</ReportSection>

			{/* Registrations over time */}
			<ReportSection
				icon={TrendingUp}
				title={labels.registrationsOverTime}
				action={
					<div className="flex border">
						{(["day", "week", "month"] as const).map((g) => (
							<Button
								key={g}
								type="button"
								variant="ghost"
								size="sm"
								className={cn(
									"rounded-none border-0 px-3",
									trendGroupBy === g && "bg-secondary",
								)}
								onClick={() => setTrendGroupBy(g)}
							>
								{g === "day"
									? labels.daily
									: g === "week"
										? labels.weekly
										: labels.monthly}
							</Button>
						))}
					</div>
				}
			>
				{trendLoading ? (
					<Skeleton className="h-56" />
				) : trend?.data.length ? (
					<div className="h-56">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={trend.data}
								margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									vertical={false}
									className="stroke-border"
								/>
								<XAxis
									dataKey="period"
									fontSize={11}
									tickLine={false}
									tickFormatter={(period: string) => {
										const date = new Date(period);
										return Number.isNaN(date.getTime())
											? period
											: date.toLocaleDateString(undefined, {
													month: "short",
													day: "numeric",
												});
									}}
								/>
								<YAxis
									allowDecimals={false}
									fontSize={11}
									tickLine={false}
									width={40}
								/>
								<Tooltip
									content={({ active, payload, label }) =>
										active && payload?.length ? (
											<div className="border bg-background px-3 py-2 shadow-md">
												<p className="font-medium text-sm">{label}</p>
												<p className="text-muted-foreground text-xs">
													{labels.count}:{" "}
													{Number(payload[0].value).toLocaleString()}
												</p>
											</div>
										) : null
									}
								/>
								<Area
									type="monotone"
									dataKey="value"
									stroke="var(--chart-1)"
									fill="var(--chart-1)"
									fillOpacity={0.15}
									strokeWidth={2}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				) : (
					<p className="py-10 text-center text-muted-foreground text-sm">
						{labels.noDataAvailable}
					</p>
				)}
			</ReportSection>

			{/* Breakdown charts — the "show count" selections, as charts */}
			<ReportSection icon={BarChart3} title={labels.customDashboard}>
				<div className="space-y-4">
					<div
						className={cn(
							"grid items-start gap-4",
							flat
								? "grid-cols-[repeat(auto-fit,minmax(min(100%,28rem),1fr))]"
								: "grid-cols-1",
						)}
					>
						<BreakdownChart
							title={labels.ticketTypeBreakdown}
							rows={ticketTypeRows ?? []}
							isLoading={ticketTypeLoading}
							showDonut
						/>
						{flat && (
							<BreakdownChart
								title={`${labels.breakdown} ${labels.by} ${humanizeFieldKey(flat.fieldKey)}`}
								rows={flat.rows}
								isLoading={customFieldLoading}
							/>
						)}
					</div>

					{/* Group cards keep long labels readable at every panel width. */}
					{nested && (
						<div className="space-y-3">
							<GroupDonutGrid
								groupLabel={humanizeFieldKey(nested.groupBy)}
								fieldLabel={humanizeFieldKey(nested.fieldKey)}
								groups={nestedGroups}
								isLoading={customFieldLoading}
							/>
						</div>
					)}

					{!customField && !customFieldLoading && (
						<p className="flex items-center gap-2 text-muted-foreground text-sm">
							<CalendarClock className="h-4 w-4 shrink-0" />
							{labels.selectCustomField}
						</p>
					)}
				</div>
			</ReportSection>
		</div>
	);
}
