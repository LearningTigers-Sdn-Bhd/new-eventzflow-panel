"use client";

import { pdf } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import {
	type AgencyNamesGroup,
	AgencyNamesReport,
	type AgencyNamesSection,
} from "@/components/pdf-reports/agency-names-report";
import { Button } from "@/components/ui/button";
import { useReportLanguage } from "@/hooks/use-report-language";
import { getEventById } from "@/lib/api/event";
import type { CustomFieldBreakdownRow } from "@/lib/api/event/analytics";
import { getCustomFieldNames } from "@/lib/api/event/analytics";

interface AgencyNamesExportProps {
	eventId: string;
	fieldKey: string;
	/** Breakdown rows in display order — decides which agencies appear and in what order. */
	rows?: CustomFieldBreakdownRow[];
	/** Combined mode: every category at once (overrides rows/groupValue). */
	groups?: { group: string; rows: CustomFieldBreakdownRow[] }[];
	/** Category the rows belong to (nested view); scopes the names query. */
	groupBy?: string;
	groupValue?: string;
	excludedTicketTypeIds?: string[];
	/** Icon-only variant for a single row. */
	compact?: boolean;
	/** Text button label override (combined mode). */
	label?: string;
}

/**
 * Downloads a PDF listing the people registered under the given breakdown
 * rows (all rows = whole table, one row = one agency). Names are fetched on
 * click, so the dashboard itself stays count-only and light.
 */
export function AgencyNamesExport({
	eventId,
	fieldKey,
	rows = [],
	groups,
	groupBy,
	groupValue,
	excludedTicketTypeIds,
	compact = false,
	label,
}: AgencyNamesExportProps) {
	const { language, labels } = useReportLanguage();
	const [busy, setBusy] = useState(false);
	const [failed, setFailed] = useState(false);
	const { data: event } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	const handleClick = async () => {
		if (!event || busy) return;
		setBusy(true);
		setFailed(false);
		try {
			const targets = groups
				? groups.map((g) => ({ groupValue: g.group, rows: g.rows }))
				: [{ groupValue, rows }];
			const groupLabel = groupBy
				? groupBy
						.split("_")
						.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
						.join(" ")
				: "";
			const sections = await Promise.all(
				targets.map(async (target): Promise<AgencyNamesSection> => {
					const single =
						!groups && target.rows.length === 1
							? target.rows[0].value
							: undefined;
					const { data } = await getCustomFieldNames(eventId, fieldKey, {
						value: single,
						groupBy,
						groupValue: target.groupValue,
						excludedTicketTypeIds,
					});
					return {
						group:
							groupBy && target.groupValue
								? { label: groupLabel, value: target.groupValue }
								: undefined,
						agencies: target.rows.map((row) => ({
							value: row.value,
							count: row.count,
							quota: row.quota,
							people: data[row.value] ?? [],
						})),
					};
				}),
			);
			const fileTag = groups
				? "All"
				: rows.length === 1
					? rows[0].value
					: (groupValue ?? "Names");
			// Let the spinner paint before the (CPU-heavy) PDF layout starts.
			await new Promise((resolve) => setTimeout(resolve, 50));
			const blob = await pdf(
				<AgencyNamesReport
					event={{
						id: eventId,
						name: event.title,
						startDate: event.start_date,
						endDate: event.end_date,
					}}
					metadata={{
						generatedAt: new Date(),
						eventStartDate: event.start_date,
						eventEndDate: event.end_date,
					}}
					language={language}
					sections={sections}
				/>,
			).toBlob();

			const safe = (text: string) => text.replace(/[^a-zA-Z0-9]+/g, "_");
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${safe(event.title)}_${safe(fileTag)}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			setTimeout(() => URL.revokeObjectURL(url), 5000);
		} catch (error) {
			console.error("Failed to export name list:", error);
			setFailed(true);
		} finally {
			setBusy(false);
		}
	};

	const Icon = busy ? Loader2 : FileDown;

	return (
		<Button
			type="button"
			variant={compact ? "ghost" : "outline"}
			size="sm"
			className={compact ? "h-7 w-7 rounded-none p-0" : "rounded-none"}
			disabled={
				!event || busy || (groups ? groups.length === 0 : rows.length === 0)
			}
			onClick={handleClick}
			title={failed ? labels.failedToLoadBreakdown : labels.downloadNameList}
			aria-label={labels.downloadNameList}
		>
			<Icon className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
			{!compact &&
				(busy ? labels.generating : (label ?? labels.downloadNameList))}
		</Button>
	);
}
