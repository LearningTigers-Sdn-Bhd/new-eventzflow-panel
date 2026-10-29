"use client";

import { useMutation } from "@tanstack/react-query";
import { Download, FileSpreadsheet, FileText, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	XAxis,
	YAxis,
} from "recharts";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { useEventSidebarContextSafe } from "@/components/sidebars/features/events/event-sidebar-provider";
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
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useHeadcountTrends } from "@/hooks/use-event-halls";
import {
	downloadHeadcountReport,
	type TrendBucket,
} from "@/lib/api/event/hall";
import { cn } from "@/lib/utils";
import { downloadBlob } from "../feedback-form/responses/export/download";
import { AllDaysCharts } from "./all-days-charts";
import { AllDaysSummary } from "./all-days-summary";
import { COMPARE_COLORS, CompareCharts } from "./compare-charts";
import { ALL_DAYS, DayPicker } from "./day-picker";
import { HallsCompared } from "./halls-compared";
import { StatTile } from "./stat-tile";
import {
	dayLabel,
	hourRange,
	type ScopeOption,
	scopeOptions,
	shortDayLabel,
	timeLabel,
} from "./trend-format";

const BUCKETS: { value: TrendBucket; label: string }[] = [
	{ value: 15, label: "15 min" },
	{ value: 60, label: "Hourly" },
];

const HOUR12_KEY = "people-counter-hour12";

/** A flat zero line across a typical day, so the axes still show before anything is counted. */
const emptyDay = (hour12: boolean) =>
	Array.from({ length: 12 }, (_, i) => ({
		label: timeLabel(
			`2000-01-01T${String(i + 8).padStart(2, "0")}:00:00`,
			hour12,
		),
		occupancy: 0,
		entries: 0,
		exits: 0,
	}));

const occupancyConfig = {
	occupancy: { label: "People inside", color: "var(--chart-1)" },
} satisfies ChartConfig;

const flowConfig = {
	entries: { label: "Entries", color: "var(--chart-2)" },
	exits: { label: "Exits", color: "var(--chart-4)" },
} satisfies ChartConfig;

interface TrendsPanelProps {
	eventId: string;
	canManage: boolean;
	onOpenSettings: () => void;
}

/** Counts over time for one day: pick the day, the time step and what to look at (event, level or hall). */
export function TrendsPanel({
	eventId,
	canManage,
	onOpenSettings,
}: TrendsPanelProps) {
	const [date, setDate] = useState<string | undefined>();
	const [bucket, setBucket] = useState<TrendBucket>(60);
	const [allDays, setAllDays] = useState(false);
	const [scopeValue, setScopeValue] = useState("event");
	// 12-hour by default; the choice is remembered in this browser only.
	const [hour12, setHour12] = useState(true);
	useEffect(() => {
		try {
			if (localStorage.getItem(HOUR12_KEY) === "0") setHour12(false);
		} catch {
			// storage blocked: keep the default
		}
	}, []);
	const chooseHour12 = (value: boolean) => {
		setHour12(value);
		try {
			localStorage.setItem(HOUR12_KEY, value ? "1" : "0");
		} catch {
			// storage blocked: the choice just won't be remembered
		}
	};

	const { data, isLoading, error, refetch, isPlaceholderData } =
		useHeadcountTrends(eventId, date, bucket);

	const eventTitle =
		useEventSidebarContextSafe()?.currentEvent?.title ?? "People counter";

	const exportReport = useMutation({
		mutationFn: async (kind: "excel" | "pdf") => {
			const day = data?.date ?? date;
			if (kind === "pdf") {
				// Loaded on demand: the PDF library is large and most visits never export.
				const { exportPeopleCounterPdf, exportPeopleCounterAllDaysPdf } =
					await import("./export-pdf");
				if (allDays)
					await exportPeopleCounterAllDaysPdf(eventId, eventTitle, hour12);
				else await exportPeopleCounterPdf(eventId, eventTitle, day, hour12);
				return;
			}
			const blob = await downloadHeadcountReport(eventId, {
				date: day,
				bucket,
				hour12,
				allDays,
			});
			downloadBlob(
				blob,
				allDays
					? "people-counts-all-days.xlsx"
					: `people-counts-${day ?? "today"}.xlsx`,
			);
		},
		onError: (e: Error) => toast.error(`Export failed: ${e.message}`),
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading trends..."
				description="Fetching the day's counts from the people counters."
				height="h-64"
			/>
		);
	}

	if (error || !data) {
		return (
			<ErrorState
				title="Failed to load trends"
				description="We couldn't load the counts over time. Please try again."
				height="h-64"
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	if (!data.configured || data.halls.length === 0) {
		return (
			<EmptyState
				title={
					data.configured ? "No halls yet" : "People counter isn't set up yet"
				}
				description={
					canManage
						? "Set up the counter connection and halls in Settings to see counts over time."
						: "Counts over time will appear once an organization owner sets up the people counter."
				}
				icon={<Users />}
				height="h-64"
				action={
					canManage && (
						<Button onClick={onOpenSettings} className="rounded-none">
							Open settings
						</Button>
					)
				}
			/>
		);
	}

	const options = scopeOptions(data);
	const selected: ScopeOption =
		options.find((o) => o.value === scopeValue) ?? options[0];
	const { points, stats } = selected.scope;
	const series = selected.series;
	const visitors = points.reduce((sum, p) => sum + p.entries, 0);
	const exits = points.reduce((sum, p) => sum + p.exits, 0);
	const compareConfig: ChartConfig = Object.fromEntries(
		(series ?? []).map((src, i) => [
			src.key,
			{ label: src.name, color: COMPARE_COLORS[i % COMPARE_COLORS.length] },
		]),
	);
	const hasMovement = (series ?? [{ points }]).some((src) =>
		src.points.some((p) => p.entries + p.exits > 0),
	);
	// With nothing counted yet, draw a flat zero line across a typical day so the axes and grid still show.
	const chartData = hasMovement
		? points.map((p) => ({ ...p, label: timeLabel(p.time, hour12) }))
		: emptyDay(hour12);
	// A bare 0..auto axis collapses when every value is 0.
	const yDomain: [number, number | "auto"] = [0, hasMovement ? "auto" : 10];

	return (
		<div
			className={cn(
				"@container space-y-4 transition-opacity",
				isPlaceholderData && "opacity-60",
			)}
		>
			<DayPicker
				eventId={eventId}
				selected={allDays ? ALL_DAYS : data.date}
				hour12={hour12}
				onSelect={(value) => {
					setAllDays(value === ALL_DAYS);
					if (value !== ALL_DAYS) setDate(value);
				}}
			/>

			<Card className="gap-0 rounded-none shadow-none">
				<CardContent className="flex flex-wrap items-end gap-4 py-4">
					{!allDays && (
						<div className="space-y-1.5">
							<p className="text-muted-foreground text-xs">Show</p>
							<Select value={selected.value} onValueChange={setScopeValue}>
								<SelectTrigger className="w-52 rounded-none">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(["Event", "Compare", "Levels", "Halls"] as const).map(
										(group) => {
											const items = options.filter((o) => o.group === group);
											if (items.length === 0) return null;
											return (
												<SelectGroup key={group}>
													<SelectLabel>{group}</SelectLabel>
													{items.map((o) => (
														<SelectItem key={o.value} value={o.value}>
															{o.label}
														</SelectItem>
													))}
												</SelectGroup>
											);
										},
									)}
								</SelectContent>
							</Select>
						</div>
					)}

					<div className="space-y-1.5">
						<p
							className="text-muted-foreground text-xs"
							title="How the day is sliced: one point per hour, or one per 15 minutes"
						>
							Group counts by
						</p>
						<div className="flex">
							{BUCKETS.map((b) => (
								<Button
									key={b.value}
									type="button"
									variant={bucket === b.value ? "default" : "outline"}
									className="rounded-none"
									aria-pressed={bucket === b.value}
									onClick={() => setBucket(b.value)}
								>
									{b.label}
								</Button>
							))}
						</div>
					</div>
					<div className="space-y-1.5">
						<p className="text-muted-foreground text-xs">Time format</p>
						<div className="flex">
							{[
								{ value: true, label: "12h" },
								{ value: false, label: "24h" },
							].map((f) => (
								<Button
									key={f.label}
									type="button"
									variant={hour12 === f.value ? "default" : "outline"}
									className="rounded-none"
									aria-pressed={hour12 === f.value}
									onClick={() => chooseHour12(f.value)}
								>
									{f.label}
								</Button>
							))}
						</div>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								variant="outline"
								className="ml-auto rounded-none"
								disabled={exportReport.isPending}
							>
								<Download className="size-4" />
								{exportReport.isPending ? "Exporting..." : "Export"}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="rounded-none">
							<DropdownMenuItem onSelect={() => exportReport.mutate("excel")}>
								<FileSpreadsheet className="size-4" />
								Excel report
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={() => exportReport.mutate("pdf")}>
								<FileText className="size-4" />
								PDF summary
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardContent>
			</Card>

			{allDays ? (
				<>
					<AllDaysSummary eventId={eventId} hour12={hour12} />
					<AllDaysCharts eventId={eventId} bucket={bucket} hour12={hour12} />
					<HallsCompared eventId={eventId} />
				</>
			) : (
				<>
					{!hasMovement && (
						<p className="text-muted-foreground text-xs">
							Nothing counted for {selected.label} on {dayLabel(data.date)} yet.
							These fill in as people are counted.
						</p>
					)}
					{series ? (
						<CompareCharts
							series={series}
							config={compareConfig}
							bucket={bucket}
							hour12={hour12}
							subtitle={`${selected.label} · ${dayLabel(data.date)}`}
							hasMovement={hasMovement}
						/>
					) : (
						<>
							<div className="grid @3xl:grid-cols-4 grid-cols-2 gap-2">
								<StatTile
									label="Visitors"
									value={hasMovement ? visitors : null}
									hint={`came in on ${shortDayLabel(data.date)}`}
									accent="border-l-violet-500"
								/>
								<StatTile
									label="Most people at once"
									value={stats?.peak.occupancy ?? null}
									hint={
										stats
											? `at ${timeLabel(stats.peak.at, hour12)}`
											: "No movement yet"
									}
									accent="border-l-emerald-500"
								/>
								<StatTile
									label="Busiest hour"
									value={stats?.busiestEntryHour.entries ?? null}
									hint={
										stats
											? `entries ${hourRange(stats.busiestEntryHour.at, hour12)}`
											: "No movement yet"
									}
									accent="border-l-sky-500"
								/>
								<StatTile
									label="Left"
									value={hasMovement ? exits : null}
									hint={`went out on ${shortDayLabel(data.date)}`}
									accent="border-l-amber-500"
								/>
							</div>

							<Card className="gap-0 rounded-none shadow-none">
								<CardHeader className="border-b pb-3">
									<CardTitle className="text-sm">People inside</CardTitle>
									<CardDescription className="text-xs">
										{selected.label} · {dayLabel(data.date)}
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-4">
									<ChartContainer
										config={occupancyConfig}
										className="aspect-auto h-64 w-full"
									>
										<AreaChart data={chartData} margin={{ left: 4, right: 12 }}>
											<CartesianGrid vertical={false} />
											<XAxis
												dataKey="label"
												tickLine={false}
												axisLine={false}
												tickMargin={8}
												minTickGap={24}
											/>
											<YAxis
												tickLine={false}
												axisLine={false}
												width={40}
												allowDecimals={false}
												domain={yDomain}
											/>
											<ChartTooltip
												content={<ChartTooltipContent indicator="line" />}
											/>
											<Area
												dataKey="occupancy"
												type="monotone"
												stroke="var(--color-occupancy)"
												fill="var(--color-occupancy)"
												fillOpacity={0.2}
											/>
										</AreaChart>
									</ChartContainer>
								</CardContent>
							</Card>

							<Card className="gap-0 rounded-none shadow-none">
								<CardHeader className="border-b pb-3">
									<CardTitle className="text-sm">Entries and exits</CardTitle>
									<CardDescription className="text-xs">
										How many people came in and left in each{" "}
										{bucket === 15 ? "15 minutes" : "hour"}
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-4">
									<ChartContainer
										config={flowConfig}
										className="aspect-auto h-64 w-full"
									>
										<BarChart data={chartData} margin={{ left: 4, right: 12 }}>
											<CartesianGrid vertical={false} />
											<XAxis
												dataKey="label"
												tickLine={false}
												axisLine={false}
												tickMargin={8}
												minTickGap={24}
											/>
											<YAxis
												tickLine={false}
												axisLine={false}
												width={40}
												allowDecimals={false}
												domain={yDomain}
											/>
											<ChartTooltip content={<ChartTooltipContent />} />
											<ChartLegend content={<ChartLegendContent />} />
											<Bar dataKey="entries" fill="var(--color-entries)" />
											<Bar dataKey="exits" fill="var(--color-exits)" />
										</BarChart>
									</ChartContainer>
								</CardContent>
							</Card>
						</>
					)}
					<HallsCompared eventId={eventId} trends={data} />
				</>
			)}
		</div>
	);
}
