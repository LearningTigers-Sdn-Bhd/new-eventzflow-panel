"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useHeadcount } from "@/hooks/use-event-halls";
import type { HeadcountTrends } from "@/lib/api/event/hall";
import { floorLabel, formatCount } from "./format";
import { dayLabel } from "./trend-format";
import { entryShares, sharesOf } from "./visitors";

const th = "px-3 py-2 font-normal text-right";

function HallsTable({
	title,
	description,
	headers,
	rows,
}: {
	title: string;
	description: string;
	headers: string[];
	rows: { key: number; label: string; level: string | null; cells: string[] }[];
}) {
	return (
		<Card className="gap-0 rounded-none shadow-none">
			<CardHeader className="border-b pb-3">
				<CardTitle className="text-sm">{title}</CardTitle>
				<CardDescription className="text-xs">{description}</CardDescription>
			</CardHeader>
			<CardContent className="pt-4">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[30rem] text-sm">
						<thead>
							<tr className="border-b text-left text-muted-foreground text-xs">
								<th className="py-2 pr-3 font-normal">Hall</th>
								{headers.map((h) => (
									<th key={h} className={th}>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr key={row.key} className="border-b last:border-0">
									<td className="py-2 pr-3">
										<span className="font-medium">{row.label}</span>{" "}
										{row.level && (
											<span className="text-muted-foreground text-xs">
												{row.level}
											</span>
										)}
									</td>
									{row.cells.map((cell, i) => (
										<td
											// biome-ignore lint/suspicious/noArrayIndexKey: fixed columns, never reordered
											key={i}
											className={
												i === 0
													? "px-3 py-2 text-right font-medium tabular-nums"
													: "px-3 py-2 text-right tabular-nums"
											}
										>
											{cell}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	);
}

/**
 * Halls side by side so it is obvious which one draws the crowd. Hidden with a single hall.
 * With `trends` (one day picked) it holds only that day; without, the whole event.
 */
export function HallsCompared({
	eventId,
	trends,
}: {
	eventId: string;
	trends?: HeadcountTrends;
}) {
	const { data } = useHeadcount(eventId);

	if (trends) {
		const halls = trends.halls.map((h) => ({
			id: h.id,
			name: h.name,
			floor: h.floor,
			visitors:
				h.status === "ok" ? h.points.reduce((n, p) => n + p.entries, 0) : null,
			peak: h.status === "ok" ? (h.stats?.peak.occupancy ?? null) : null,
		}));
		if (halls.length < 2) return null;
		const shares = sharesOf(
			halls.map((h) => ({ id: h.id, value: h.visitors })),
		);
		return (
			<HallsTable
				title="Halls on this day"
				description={`Who came in at each hall on ${dayLabel(trends.date)}, and its share of that day's visitors.`}
				headers={["Visitors", "Share", "Peak crowd"]}
				rows={halls.map((h) => {
					const share = shares.get(h.id) ?? null;
					return {
						key: h.id,
						label: h.name,
						level: h.floor ? floorLabel(h.floor) : null,
						cells: [
							formatCount(h.visitors),
							share === null ? "—" : `${share}%`,
							formatCount(h.peak),
						],
					};
				})}
			/>
		);
	}

	const halls = data?.halls ?? [];
	if (!data?.configured || halls.length < 2) return null;
	const shares = entryShares(halls);
	return (
		<HallsTable
			title="Hall totals"
			description="Who came in at each hall over the whole event, and its share of everyone counted."
			headers={["Whole event", "Share", "Inside now"]}
			rows={halls.map((h) => {
				const share = shares.get(h.id) ?? null;
				return {
					key: h.id,
					label: h.name,
					level: h.floor ? floorLabel(h.floor) : null,
					cells: [
						formatCount(h.inEvent),
						share === null ? "—" : `${share}%`,
						formatCount(h.insideNow),
					],
				};
			})}
		/>
	);
}
