import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, ListIndentIncrease, Search } from "lucide-react";
import { useState } from "react";
import { StatsCard } from "@/components/admin-ui/analytic";
import { Button } from "@/components/ui/button";
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
import {
	deleteCustomFieldQuota,
	setCustomFieldQuota,
} from "@/lib/api/event/analytics";

interface BreakdownTableProps {
	labelHeader: string;
	rows: CustomFieldBreakdownRow[] | undefined;
	isLoading: boolean;
	/** Present together, enables the editable quota column for this field. */
	eventId?: string;
	fieldKey?: string;
}

/**
 * Shared count-only breakdown view (summary stat tiles + numbered table with
 * a grand-total footer row) used by both the ticket type and custom field
 * breakdown cards — mirrors the "Bil. / Senarai / Jumlah" reference report.
 *
 * When eventId+fieldKey are given, a row's quota is editable inline. Rows
 * with no quota set keep the plain "Count" column; once a quota is set that
 * row switches to Quota / Registered / Remaining — quota is informational
 * only and never restricts registration.
 */
export function BreakdownTable({
	labelHeader,
	rows,
	isLoading,
	eventId,
	fieldKey,
}: BreakdownTableProps) {
	const { labels } = useReportLanguage();
	const [search, setSearch] = useState("");
	const [showQuotaColumn, setShowQuotaColumn] = useState(false);
	const queryClient = useQueryClient();

	const quotaMutation = useMutation({
		mutationFn: ({ value, quota }: { value: string; quota: number }) =>
			setCustomFieldQuota(eventId as string, fieldKey as string, value, quota),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "custom_field_breakdown"],
			});
		},
	});

	const quotaDeleteMutation = useMutation({
		mutationFn: ({ value }: { value: string }) =>
			deleteCustomFieldQuota(eventId as string, fieldKey as string, value),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "custom_field_breakdown"],
			});
		},
	});

	const quotaCapable = !!eventId && !!fieldKey;
	const canEditQuota = quotaCapable && showQuotaColumn;
	const hasAnyQuota = !!rows?.some((row) => row.quota !== undefined);
	const showQuotaCol = canEditQuota || hasAnyQuota;
	const colSpanCount = 3 + (showQuotaCol ? 1 : 0) + (hasAnyQuota ? 1 : 0);

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

			{!isLoading &&
				rows &&
				rows.length > 0 &&
				(rows.length > 5 || quotaCapable) && (
					<div className="flex flex-wrap items-center justify-between gap-2">
						{rows.length > 5 ? (
							<div className="relative flex-1">
								<Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder={labels.searchPlaceholder}
									className="rounded-none pl-8"
								/>
							</div>
						) : (
							<div />
						)}

						{quotaCapable && (
							<Button
								type="button"
								variant={showQuotaColumn ? "secondary" : "outline"}
								size="sm"
								className="rounded-none"
								onClick={() => setShowQuotaColumn((prev) => !prev)}
							>
								<ListIndentIncrease className="h-4 w-4" />
								{showQuotaColumn ? labels.hideQuota : labels.setQuota}
							</Button>
						)}
					</div>
				)}

			{showQuotaColumn && (
				<div className="flex items-start gap-2 border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900 text-xs dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
					<ListIndentIncrease className="mt-0.5 h-3.5 w-3.5 shrink-0" />
					<span>{labels.quotaAutoSaveNotice}</span>
				</div>
			)}

			<div className="overflow-x-auto rounded-none border">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead className="w-12">{labels.billNo}</TableHead>
							<TableHead>{labelHeader}</TableHead>
							{showQuotaCol && (
								<TableHead className="text-right">{labels.quota}</TableHead>
							)}
							<TableHead className="text-right">
								{hasAnyQuota ? labels.registered : labels.count}
							</TableHead>
							{hasAnyQuota && (
								<TableHead className="text-right">{labels.remaining}</TableHead>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={colSpanCount}
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
									{showQuotaCol &&
										(canEditQuota ? (
											<TableCell className="text-right">
												<Input
													type="number"
													min={0}
													defaultValue={row.quota ?? ""}
													placeholder="-"
													className="ml-auto h-8 w-24 rounded-none text-right"
													onBlur={(e) => {
														const raw = e.target.value.trim();
														if (!raw) {
															if (row.quota === undefined) return;
															quotaDeleteMutation.mutate({ value: row.value });
															return;
														}
														const nextQuota = Number(raw);
														if (
															!Number.isFinite(nextQuota) ||
															nextQuota < 0 ||
															nextQuota === row.quota
														)
															return;
														quotaMutation.mutate({
															value: row.value,
															quota: nextQuota,
														});
													}}
												/>
											</TableCell>
										) : (
											<TableCell className="text-right">
												{row.quota?.toLocaleString() ?? "-"}
											</TableCell>
										))}
									<TableCell className="text-right font-medium">
										{row.quota !== undefined ? (
											<span
												className={
													row.count > row.quota
														? "font-semibold text-destructive"
														: undefined
												}
											>
												{row.count.toLocaleString()} (
												{Math.round((row.count / row.quota) * 100)}%)
											</span>
										) : (
											row.count.toLocaleString()
										)}
									</TableCell>
									{hasAnyQuota && (
										<TableCell className="text-right">
											{row.quota !== undefined ? (
												<span
													className={
														row.count > row.quota
															? "font-semibold text-destructive"
															: undefined
													}
												>
													{(row.remaining ?? 0).toLocaleString()} (
													{Math.round(((row.remaining ?? 0) / row.quota) * 100)}
													%)
												</span>
											) : (
												"-"
											)}
										</TableCell>
									)}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={colSpanCount}
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
								<TableCell
									colSpan={showQuotaCol ? 3 : 2}
									className="font-semibold"
								>
									{labels.total}
								</TableCell>
								<TableCell className="text-right font-semibold">
									{(search.trim() ? filteredTotal : total).toLocaleString()}
								</TableCell>
								{hasAnyQuota && <TableCell />}
							</TableRow>
						</TableFooter>
					)}
				</Table>
			</div>

			{(quotaMutation.isError || quotaDeleteMutation.isError) && (
				<p className="text-destructive text-sm">{labels.quotaUpdateFailed}</p>
			)}
		</div>
	);
}
