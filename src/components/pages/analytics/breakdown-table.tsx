import { Layers, Search } from "lucide-react";
import { useState } from "react";
import { StatsCard } from "@/components/admin-ui/analytic";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useReportLanguage } from "@/hooks/use-report-language";
import type { CustomFieldBreakdownRow } from "@/lib/api/event/analytics";

interface BreakdownTableProps {
	labelHeader: string;
	rows: CustomFieldBreakdownRow[] | undefined;
	isLoading: boolean;
}

/**
 * Shared count-only breakdown view (summary stat tiles + numbered table with
 * a grand-total footer row) used by both the ticket type and custom field
 * breakdown cards — mirrors the "Bil. / Senarai / Jumlah" reference report.
 */
export function BreakdownTable({
	labelHeader,
	rows,
	isLoading,
}: BreakdownTableProps) {
	const { labels } = useReportLanguage();
	const [search, setSearch] = useState("");

	// Stat tiles always reflect the full group — only the table body/footer
	// below honor the search filter, so search never changes the numbers.
	const total = rows?.reduce((sum, row) => sum + row.count, 0) ?? 0;
	const topRow = rows?.length
		? rows.reduce((top, row) => (row.count > top.count ? row : top))
		: undefined;

	const filteredRows = search.trim()
		? rows?.filter((row) =>
				row.value.toLowerCase().includes(search.trim().toLowerCase()),
			)
		: rows;
	const filteredTotal =
		filteredRows?.reduce((sum, row) => sum + row.count, 0) ?? 0;

	return (
		<div className="space-y-3">
			{!isLoading && rows && rows.length > 0 && (
				<div className="grid grid-cols-2 gap-2 border-y border-dashed lg:grid-cols-3">
					<StatsCard
						label={labels.totalTickets}
						value={total.toLocaleString()}
						Icon={Layers}
					/>
					<StatsCard
						label={`${labels.distinct} ${labelHeader}`}
						value={rows.length.toLocaleString()}
						Icon={Layers}
					/>
					{topRow && (
						<StatsCard
							label={labels.topValue}
							value={topRow.count.toLocaleString()}
							subtitle={topRow.value}
							Icon={Layers}
						/>
					)}
				</div>
			)}

			{!isLoading && rows && rows.length > 5 && (
				<div className="relative max-w-xs">
					<Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder={labels.searchPlaceholder}
						className="rounded-none pl-8"
					/>
				</div>
			)}

			<div className="overflow-x-auto rounded-none border">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead className="w-12">{labels.billNo}</TableHead>
							<TableHead>{labelHeader}</TableHead>
							<TableHead className="text-right">{labels.count}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={3}
									className="h-24 text-center text-muted-foreground"
								>
									{labels.loading}
								</TableCell>
							</TableRow>
						) : filteredRows?.length ? (
							filteredRows.map((row, index) => (
								<TableRow key={row.value}>
									<TableCell className="text-muted-foreground">
										{index + 1}
									</TableCell>
									<TableCell>{row.value}</TableCell>
									<TableCell className="text-right font-medium">
										{row.count.toLocaleString()}
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={3}
									className="h-24 text-center text-muted-foreground"
								>
									{rows?.length
										? labels.noMatchesForSearch
										: labels.noDataAvailable}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
					{!isLoading && filteredRows && filteredRows.length > 0 && (
						<TableFooter>
							<TableRow>
								<TableCell colSpan={2} className="font-semibold">
									{labels.total}
								</TableCell>
								<TableCell className="text-right font-semibold">
									{(search.trim() ? filteredTotal : total).toLocaleString()}
								</TableCell>
							</TableRow>
						</TableFooter>
					)}
				</Table>
			</div>
		</div>
	);
}
