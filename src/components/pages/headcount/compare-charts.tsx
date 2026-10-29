import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "recharts";
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
import type { TrendBucket } from "@/lib/api/event/hall";
import { type CompareSource, compareRows } from "./trend-format";

export const COMPARE_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
];

interface CompareChartsProps {
	/** What the lines stand for, in the Entries subtitle. */
	by?: string;
	series: CompareSource[];
	config: ChartConfig;
	bucket: TrendBucket;
	subtitle: string;
	hasMovement: boolean;
	hour12: boolean;
}

/** Halls (or levels) side by side over the day: people inside as lines, entries as grouped bars. */
export function CompareCharts({
	series,
	config,
	bucket,
	subtitle,
	hasMovement,
	hour12,
	by = "venue",
}: CompareChartsProps) {
	const occupancy = compareRows(series, "occupancy", hour12);
	const entries = compareRows(series, "entries", hour12);
	const domain: [number, number | "auto"] = [0, hasMovement ? "auto" : 10];

	return (
		<>
			<Card className="gap-0 rounded-none shadow-none">
				<CardHeader className="border-b pb-3">
					<CardTitle className="text-sm">People inside</CardTitle>
					<CardDescription className="text-xs">{subtitle}</CardDescription>
				</CardHeader>
				<CardContent className="pt-4">
					<ChartContainer config={config} className="aspect-auto h-72 w-full">
						<LineChart data={occupancy} margin={{ left: 4, right: 12 }}>
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
								domain={domain}
							/>
							<ChartTooltip
								content={<ChartTooltipContent indicator="line" />}
							/>
							<ChartLegend content={<ChartLegendContent />} />
							{series.map((s) => (
								<Line
									key={s.key}
									dataKey={s.key}
									type="monotone"
									stroke={`var(--color-${s.key})`}
									strokeWidth={2}
									dot={false}
								/>
							))}
						</LineChart>
					</ChartContainer>
				</CardContent>
			</Card>

			<Card className="gap-0 rounded-none shadow-none">
				<CardHeader className="border-b pb-3">
					<CardTitle className="text-sm">Entries</CardTitle>
					<CardDescription className="text-xs">
						People who came in during each{" "}
						{bucket === 15 ? "15 minutes" : "hour"}, by {by}
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-4">
					<ChartContainer config={config} className="aspect-auto h-72 w-full">
						<BarChart data={entries} margin={{ left: 4, right: 12 }}>
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
								domain={domain}
							/>
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />
							{series.map((s) => (
								<Bar
									key={s.key}
									dataKey={s.key}
									fill={`var(--color-${s.key})`}
								/>
							))}
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>
		</>
	);
}
