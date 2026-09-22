"use client";

import { useQuery } from "@tanstack/react-query";
import { ListFilter } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { useReportLanguage } from "@/hooks/use-report-language";
import type { CustomFieldBreakdownRow } from "@/lib/api/event/analytics";
import {
	getCustomFieldBreakdown,
	getCustomFieldKeys,
} from "@/lib/api/event/analytics";
import { BreakdownTable } from "./breakdown-table";
import { GroupFilterSelect } from "./group-filter-select";
import { NestedBreakdownGroups } from "./nested-breakdown-groups";
import { ReportSection } from "./report-section";

// snake_case jsonb key -> readable label, e.g. "nama_agensi" -> "Nama Agensi"
export function humanizeFieldKey(key: string): string {
	return key
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

export type CustomFieldBreakdownChange =
	| { fieldKey: string; rows: CustomFieldBreakdownRow[] }
	| {
			fieldKey: string;
			groupBy: string;
			groups: { group: string; rows: CustomFieldBreakdownRow[] }[];
	  }
	| null;

interface CustomFieldBreakdownCardProps {
	eventId: string;
	onDataChange?: (result: CustomFieldBreakdownChange) => void;
}

const NONE_VALUE = "__none__";

/**
 * Count-only breakdown of tickets grouped by any custom_fields_data jsonb key,
 * optionally nested under a second key (e.g. Kementerian/Jabatan lists nested
 * under "kategori" in the reference report). The key list is auto-detected
 * from the event's own tickets — no hardcoded field names.
 */
export function CustomFieldBreakdownCard({
	eventId,
	onDataChange,
}: CustomFieldBreakdownCardProps) {
	const { labels } = useReportLanguage();
	const { data: keysData, isLoading: keysLoading } = useQuery({
		queryKey: ["event", eventId, "custom_field_keys"],
		queryFn: () => getCustomFieldKeys(eventId),
	});

	const [selectedKey, setSelectedKey] = usePersistedState(
		`event-${eventId}-custom-field-breakdown-key`,
		"",
	);
	const [groupByKey, setGroupByKey] = usePersistedState(
		`event-${eventId}-custom-field-breakdown-group-by`,
		"",
	);

	// Selected keys may no longer exist for this event — clear once keys load.
	useEffect(() => {
		if (!keysData) return;
		if (selectedKey && !keysData.keys.includes(selectedKey)) setSelectedKey("");
		if (groupByKey && !keysData.keys.includes(groupByKey)) setGroupByKey("");
	}, [keysData, selectedKey, groupByKey, setSelectedKey, setGroupByKey]);

	const { data, isLoading, error } = useQuery({
		queryKey: [
			"event",
			eventId,
			"custom_field_breakdown",
			selectedKey,
			groupByKey,
		],
		queryFn: () =>
			getCustomFieldBreakdown(eventId, selectedKey, groupByKey || undefined),
		enabled: !!selectedKey,
	});

	const isNested = data && "groups" in data;

	// null = show all groups (default, until the organizer actively filters).
	// Persisted per event+field so the chosen filter survives a reload.
	const [visibleGroupNames, setVisibleGroupNames] = usePersistedState<
		string[] | null
	>(
		`event-${eventId}-custom-field-breakdown-visible-groups-${groupByKey}`,
		null,
	);

	const allGroupNames = useMemo(
		() => (isNested ? data.groups.map((g) => g.group) : []),
		[isNested, data],
	);
	const visibleGroups = useMemo(
		() =>
			isNested && visibleGroupNames
				? data.groups.filter((g) => visibleGroupNames.includes(g.group))
				: data && isNested
					? data.groups
					: undefined,
		[isNested, data, visibleGroupNames],
	);

	useEffect(() => {
		if (!data) {
			onDataChange?.(null);
		} else if (isNested) {
			onDataChange?.({
				fieldKey: data.fieldKey,
				groupBy: data.groupBy,
				groups: (visibleGroups ?? []).map((g) => ({
					group: g.group,
					rows: g.rows,
				})),
			});
		} else {
			onDataChange?.({ fieldKey: data.fieldKey, rows: data.data });
		}
	}, [data, isNested, visibleGroups, onDataChange]);

	const groupByOptions =
		keysData?.keys.filter((key) => key !== selectedKey) ?? [];

	return (
		<ReportSection icon={ListFilter} title={labels.customFieldBreakdown}>
			<div className="mb-3 flex flex-wrap gap-4">
				<div className="max-w-sm flex-1 space-y-1">
					<span className="text-muted-foreground text-xs">
						{labels.customRegistrationField}
					</span>
					<Select
						value={selectedKey}
						onValueChange={setSelectedKey}
						disabled={keysLoading || !keysData?.keys.length}
					>
						<SelectTrigger className="w-full rounded-none">
							<SelectValue
								placeholder={
									keysLoading
										? labels.loadingFields
										: keysData?.keys.length
											? labels.selectCustomField
											: labels.noCustomFieldsFound
								}
							/>
						</SelectTrigger>
						<SelectContent className="rounded-none p-0">
							{keysData?.keys.map((key, index) => (
								<div key={key}>
									{index > 0 && <SelectSeparator className="my-0" />}
									<SelectItem value={key} className="rounded-none px-3 py-2">
										{humanizeFieldKey(key)}
									</SelectItem>
								</div>
							))}
						</SelectContent>
					</Select>
				</div>

				{selectedKey && (
					<div className="max-w-sm flex-1 space-y-1">
						<span className="text-muted-foreground text-xs">
							{labels.groupByOptional}
						</span>
						<Select
							value={groupByKey || NONE_VALUE}
							onValueChange={(value) =>
								setGroupByKey(value === NONE_VALUE ? "" : value)
							}
						>
							<SelectTrigger className="w-full rounded-none">
								<SelectValue placeholder={labels.noGrouping} />
							</SelectTrigger>
							<SelectContent className="rounded-none p-0">
								<SelectItem
									value={NONE_VALUE}
									className="rounded-none px-3 py-2"
								>
									{labels.noGrouping}
								</SelectItem>
								{groupByOptions.map((key) => (
									<div key={key}>
										<SelectSeparator className="my-0" />
										<SelectItem value={key} className="rounded-none px-3 py-2">
											{humanizeFieldKey(key)}
										</SelectItem>
									</div>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{isNested && allGroupNames.length > 1 && (
					<div className="max-w-sm flex-1 space-y-1">
						<span className="text-muted-foreground text-xs">
							{labels.show} {humanizeFieldKey(groupByKey)}
						</span>
						<GroupFilterSelect
							options={allGroupNames}
							selected={visibleGroupNames ?? allGroupNames}
							onChange={setVisibleGroupNames}
							allLabel={labels.allSelected}
						/>
					</div>
				)}
			</div>

			{error && (
				<p className="mb-3 text-destructive text-sm">
					{labels.failedToLoadBreakdown}
				</p>
			)}

			{selectedKey && isNested && (
				<NestedBreakdownGroups
					groupLabel={humanizeFieldKey(groupByKey)}
					fieldLabel={humanizeFieldKey(selectedKey)}
					groups={visibleGroups}
					isLoading={isLoading}
				/>
			)}

			{selectedKey && !groupByKey && (
				<BreakdownTable
					labelHeader={humanizeFieldKey(selectedKey)}
					rows={!isNested ? data?.data : undefined}
					isLoading={isLoading}
				/>
			)}
		</ReportSection>
	);
}
