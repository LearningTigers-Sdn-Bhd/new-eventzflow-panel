"use client";

import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

type MediaTypeFilter = "active" | "archived" | "all";

interface MediaTypeTableControlProps<TData> {
	table: Table<TData>;
	filter?: MediaTypeFilter;
	onFilterChange?: (filter: MediaTypeFilter) => void;
}

export function MediaTypeTableControl<TData>({
	table,
	filter = "active",
	onFilterChange,
}: MediaTypeTableControlProps<TData>) {
	const filterControl = useMemo(() => (onFilterChange
		? {
				label: "Filter",
				columnId: "filter",
				customFilter: {
					value: filter,
					onChange: (value: string) => onFilterChange(value as MediaTypeFilter),
				},
				type: "filter" as const,
				data: [
					{ label: "Active", value: "active" },
					{ label: "Archived", value: "archived" },
					{ label: "All", value: "all" },
				],
			}
		: null), [filter, onFilterChange]);

	const desktopControlConfigs: ControlConfig[] = useMemo(() => [
		...(filterControl ? [filterControl] : []),
		{
			label: "Sort by Name",
			columnId: "name",
			type: "sort",
		},
		{
			label: "Sort by Date",
			columnId: "createdAt",
			type: "sort",
		},
	], [filterControl]);

	const mobileControlConfigs: ControlConfig[] = useMemo(() => [
		...(filterControl ? [{ ...filterControl, topPriority: true }] : []),
		{
			label: "Sort by Name",
			columnId: "name",
			type: "sort",
			topPriority: true,
		},
		{
			label: "Sort by Date",
			columnId: "createdAt",
			type: "sort",
		},
	], [filterControl]);

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search media types...",
					enableCustomSearch: true,
					columns: ["name", "description"],
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
