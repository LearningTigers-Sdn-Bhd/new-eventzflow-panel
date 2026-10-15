"use client";

import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import type { VehicleRegistration } from "@/lib/api/vehicle-registration";
import { ALL_GROUPS, ALL_ISSUES, ISSUES_ONLY } from "./vehicle-table-columns";

type ArchivedFilter = "active" | "archived";

interface DataControlProps {
	table: Table<VehicleRegistration>;
	archivedFilter?: ArchivedFilter;
	onArchivedFilterChange?: (filter: ArchivedFilter) => void;
}

export function DataControl({
	table,
	archivedFilter = "active",
	onArchivedFilterChange,
}: DataControlProps) {
	const groupOptions = useMemo(() => {
		const seen = new Map<number, string>();
		for (const row of table.getPreFilteredRowModel().rows) {
			const { id, name } = row.original.registrationForm;
			if (id != null && name) seen.set(id, name);
		}
		return Array.from(seen, ([id, name]) => ({ id, name }));
	}, [table]);

	const groupFilterControl: ControlConfig = {
		label: "Group",
		columnId: "group",
		type: "filter",
		data: [
			{ label: "All", value: ALL_GROUPS },
			...groupOptions.map((group) => ({
				label: group.name,
				value: group.id.toString(),
			})),
		],
		customFilter: {
			value:
				(table.getColumn("group")?.getFilterValue() as string | undefined) ??
				ALL_GROUPS,
			onChange: (value: string) => {
				const column = table.getColumn("group");
				column?.setFilterValue(
					value === ALL_GROUPS ? undefined : Number(value),
				);
			},
		},
	};

	const issuesFilterControl: ControlConfig = {
		label: "Issues",
		columnId: "issueCount",
		type: "filter",
		data: [
			{ label: "All", value: ALL_ISSUES },
			{ label: "Issues only", value: ISSUES_ONLY },
		],
		customFilter: {
			value:
				(table.getColumn("issueCount")?.getFilterValue() as
					| string
					| undefined) ?? ALL_ISSUES,
			onChange: (value: string) => {
				const column = table.getColumn("issueCount");
				column?.setFilterValue(value === ALL_ISSUES ? undefined : value);
			},
		},
	};

	const archivedFilterControl: ControlConfig | null = onArchivedFilterChange
		? {
				label: "Status",
				columnId: "archived",
				type: "filter",
				data: [
					{ label: "Active", value: "active" },
					{ label: "Archived", value: "archived" },
				],
				customFilter: {
					value: archivedFilter,
					onChange: (value: string) =>
						onArchivedFilterChange(value as ArchivedFilter),
				},
			}
		: null;

	const desktopControlConfigs: ControlConfig[] = [
		...(archivedFilterControl ? [archivedFilterControl] : []),
		groupFilterControl,
		issuesFilterControl,
	];

	const mobileControlConfigs: ControlConfig[] = [
		...(archivedFilterControl
			? [{ ...archivedFilterControl, topPriority: true }]
			: []),
		{ ...groupFilterControl, topPriority: true },
		{ ...issuesFilterControl, topPriority: true },
		{ label: "Plate", columnId: "plate", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search plate or crew name...",
					enableCustomSearch: false,
					columns: ["plate", "crewSearch"],
				},
			}}
			desktopConfig={{
				controlConfigs: desktopControlConfigs,
			}}
			mobileConfig={{
				controlConfigs: mobileControlConfigs,
			}}
		/>
	);
}
