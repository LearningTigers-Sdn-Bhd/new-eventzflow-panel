"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { useDailyBreakdown } from "@/hooks/use-event-halls";
import { cn } from "@/lib/utils";
import { formatCount } from "./format";
import { dayLabel, hourRange, shortDayLabel, timeLabel } from "./trend-format";

const config = {
	entries: { label: "Came in", color: "var(--chart-2)" },
	exits: { label: "Left", color: "var(--chart-4)" },
} satisfies ChartConfig;

interface DayByDayProps {
	eventId: string;
	/** The day shown below, highlighted in the table. */
	selectedDate: string;
	onSelect: (date: string) => void;
}

/** Every event day side by side. Hidden until there are two days to compare; a row opens that day. */
export function DayByDay({ eventId, selectedDate, onSelect }: DayByDayProps) {
	const { data } = useDailyBreakdown(eventId);
	const days = data?.days ?? [];
	if (!data?.configured || days.length < 2) return null;

	const chartData = days.map((d) => ({ ...d, label: shortDayLabel(d.date) }));

	return (
		<Card className="gap-0 rounded-none shadow-none">
			<CardHeader className="border-b pb-3">
				<CardTitle className="text-sm">Day by day</CardTitle>
				<CardDescription className="text-xs">
					Every event day so far. Pick a day to see it hour by hour below.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 pt-4">
				<ChartContainer config={config} className="aspect-auto h-48 w-full">
					<BarChart data={chartData} margin={{ left: 4, right: 12 }}>
						<CartesianGrid vertical={false} />
						<XAxis dataKey="label" tickLine={false} axisLine={false} />
						<YAxis
							tickLine={false}
							axisLine={false}
							width={40}
							allowDecimals={false}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
						<Bar dataKey="entries" fill="var(--color-entries)" />
						<Bar dataKey="exits" fill="var(--color-exits)" />
					</BarChart>
				</ChartContainer>

				<div className="overflow-x-auto">
					<table className="w-full min-w-[34rem] text-sm">
						<thead>
							<tr className="border-b text-left text-muted-foreground text-xs">
								<th className="py-2 pr-3 font-normal">Day</th>
								<th className="px-3 py-2 text-right font-normal">Came in</th>
								<th className="px-3 py-2 text-right font-normal">Left</th>
								<th className="px-3 py-2 text-right font-normal">Peak crowd</th>
								<th className="px-3 py-2 font-normal">Busiest hour</th>
								<th className="py-2 pl-3 text-right font-normal">
									Inside at close
								</th>
							</tr>
						</thead>
						<tbody>
							{days.map((d) => (
								<tr
									key={d.date}
									className={cn(
										"border-b last:border-0",
										d.date === selectedDate && "bg-muted/60",
									)}
								>
									<td className="py-2 pr-3">
										<button
											type="button"
											onClick={() => onSelect(d.date)}
											aria-current={d.date === selectedDate}
											className="font-medium underline-offset-4 hover:underline"
										>
											{dayLabel(d.date)}
										</button>
									</td>
									<td className="px-3 py-2 text-right tabular-nums">
										{formatCount(d.entries)}
									</td>
									<td className="px-3 py-2 text-right tabular-nums">
										{formatCount(d.exits)}
									</td>
									<td className="px-3 py-2 text-right tabular-nums">
										{d.peak ? (
											<>
												{formatCount(d.peak.occupancy)}{" "}
												<span className="text-muted-foreground text-xs">
													at {timeLabel(d.peak.at)}
												</span>
											</>
										) : (
											"—"
										)}
									</td>
									<td className="px-3 py-2 text-muted-foreground">
										{d.busiestEntryHour
											? hourRange(d.busiestEntryHour.at)
											: "—"}
									</td>
									<td className="py-2 pl-3 text-right tabular-nums">
										{formatCount(d.closing)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	);
}
