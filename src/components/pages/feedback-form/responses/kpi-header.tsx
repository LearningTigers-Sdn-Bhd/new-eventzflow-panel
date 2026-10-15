"use client";

import { Area, AreaChart, XAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { FeedbackSummary } from "@/lib/api/feedback-form";
import { formatPercent, formatScore } from "./filters";

const chartConfig = {
	count: { label: "Responses", color: "var(--primary)" },
} satisfies ChartConfig;

/** Headline numbers for the current filter, plus responses per day. */
export function FeedbackKpiHeader({ summary }: { summary: FeedbackSummary }) {
	const rate = summary.response_rate;
	const timeline = summary.timeline ?? [];

	return (
		<div className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<Kpi
					label="Responses"
					value={String(summary.total_responses)}
					hint={
						summary.last_submitted_at
							? `Latest ${new Date(summary.last_submitted_at).toLocaleString()}`
							: "No submissions yet"
					}
				/>
				<Kpi
					label="Response rate"
					value={rate ? formatPercent(rate.percent) : "—"}
					hint={
						rate
							? rate.eligible === 0
								? "No checked-in attendees yet"
								: `${rate.responded} of ${rate.eligible} checked-in attendees`
							: undefined
					}
				/>
				<Kpi
					label="Average score"
					value={formatScore(summary.overall_average)}
					suffix={summary.overall_average != null ? "/ 5" : undefined}
					hint="Across all rating questions"
				/>
				<Kpi
					label="Satisfied"
					value={formatPercent(summary.overall_satisfied_percent)}
					hint="Ratings of 4 or 5"
				/>
			</div>

			{timeline.length > 1 && (
				<section className="border border-dashed p-4">
					<p className="mb-2 text-muted-foreground text-sm">
						Responses per day
					</p>
					<ChartContainer
						config={chartConfig}
						className="aspect-auto h-24 w-full"
					>
						<AreaChart data={timeline} margin={{ left: 0, right: 0, top: 4 }}>
							<XAxis
								dataKey="date"
								tickLine={false}
								axisLine={false}
								tickMargin={6}
								minTickGap={32}
								tickFormatter={(value: string) =>
									new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
										month: "short",
										day: "numeric",
									})
								}
							/>
							<ChartTooltip
								content={<ChartTooltipContent hideLabel={false} />}
							/>
							<Area
								dataKey="count"
								type="monotone"
								stroke="var(--color-count)"
								fill="var(--color-count)"
								fillOpacity={0.15}
								strokeWidth={2}
							/>
						</AreaChart>
					</ChartContainer>
				</section>
			)}
		</div>
	);
}

function Kpi({
	label,
	value,
	suffix,
	hint,
}: {
	label: string;
	value: string;
	suffix?: string;
	hint?: string;
}) {
	return (
		<section className="space-y-1 border border-dashed p-5">
			<p className="text-muted-foreground text-sm">{label}</p>
			<p className="font-semibold text-3xl tabular-nums">
				{value}
				{suffix && (
					<span className="ml-1.5 font-normal text-base text-muted-foreground">
						{suffix}
					</span>
				)}
			</p>
			{hint && <p className="text-muted-foreground text-xs">{hint}</p>}
		</section>
	);
}
