"use client";

import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

type TopicFilter = "active" | "archived" | "all";

interface TopicsTableControlProps<TData> {
	table: Table<TData>;
	filter?: TopicFilter;
	onFilterChange?: (filter: TopicFilter) => void;
}

export function TopicsTableControl<TData>({
	table,
	filter = "active",
	onFilterChange,
}: TopicsTableControlProps<TData>) {
	const filterControl = useMemo(() => (onFilterChange
		? {
				label: "Filter",
				columnId: "filter",
				customFilter: {
					value: filter,
					onChange: (value: string) => onFilterChange(value as TopicFilter),
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
					placeholder: "Search topics...",
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