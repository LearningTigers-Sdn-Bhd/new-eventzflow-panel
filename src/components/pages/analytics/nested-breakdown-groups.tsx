import { Layers } from "lucide-react";
import { StatsCard } from "@/components/admin-ui/analytic";
import { Badge } from "@/components/ui/badge";
import { useReportLanguage } from "@/hooks/use-report-language";
import type { CustomFieldBreakdownGroup } from "@/lib/api/event/analytics";
import { BreakdownTable } from "./breakdown-table";

interface NestedBreakdownGroupsProps {
	groupLabel: string;
	fieldLabel: string;
	groups: CustomFieldBreakdownGroup[] | undefined;
	isLoading: boolean;
	/** Present together, enables the editable quota column in each subtable. */
	eventId?: string;
	fieldKey?: string;
}

/**
 * Renders one table per group value (e.g. one per "kategori"), each with its
 * own subtotal — matching the Kementerian/Jabatan-under-category layout of
 * the reference report, generalized to any two custom fields.
 */
export function NestedBreakdownGroups({
	groupLabel,
	fieldLabel,
	groups,
	isLoading,
	eventId,
	fieldKey,
}: NestedBreakdownGroupsProps) {
	const { labels } = useReportLanguage();

	if (isLoading) {
		return (
			<p className="py-6 text-center text-muted-foreground text-sm">
				{labels.loading}
			</p>
		);
	}

	if (!groups?.length) {
		return (
			<p className="py-6 text-center text-muted-foreground text-sm">
				{labels.noDataAvailable}
			</p>
		);
	}

	const grandTotal = groups.reduce((sum, group) => sum + group.total, 0);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-2 border-y border-dashed">
				<StatsCard
					label={labels.totalTickets}
					value={grandTotal.toLocaleString()}
					Icon={Layers}
				/>
				<StatsCard
					label={`${labels.distinct} ${groupLabel}`}
					value={groups.length.toLocaleString()}
					Icon={Layers}
				/>
			</div>

			{groups.map((group) => (
				<div key={group.group} className="border">
					<div className="flex items-center justify-between gap-2 border-b bg-muted/50 px-3 py-2">
						<div>
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								{groupLabel}
							</p>
							<p className="font-semibold text-sm">{group.group}</p>
						</div>
						<Badge variant="secondary" className="rounded-none font-bold">
							{group.total.toLocaleString()}
						</Badge>
					</div>
					<div className="p-3">
						<BreakdownTable
							labelHeader={fieldLabel}
							rows={group.rows}
							isLoading={false}
							eventId={eventId}
							fieldKey={fieldKey}
						/>
					</div>
				</div>
			))}
		</div>
	);
}
