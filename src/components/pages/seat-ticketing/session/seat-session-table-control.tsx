"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

export type SeatSessionFilter = "active" | "archived" | "all";

interface DataControlProps<TData> {
	table: Table<TData>;
	sessionFilter?: SeatSessionFilter;
	onSessionFilterChange?: (filter: SeatSessionFilter) => void;
}

export function DataControl<TData>({
	table,
	sessionFilter = "active",
	onSessionFilterChange,
}: DataControlProps<TData>) {
	const sessionFilterControl = onSessionFilterChange
		? {
				label: "Session Filter",
				columnId: "sessionFilter",
				customFilter: {
					value: sessionFilter,
					onChange: (value: string) =>
						onSessionFilterChange(value as SeatSessionFilter),
				},
			}
		: null;

	const desktopControlConfigs: ControlConfig[] = [
		...(sessionFilterControl
			? [
					{
						...sessionFilterControl,
						type: "filter" as const,
						data: [
							{ label: "Active", value: "active" },
							{ label: "Archived", value: "archived" },
							{ label: "All", value: "all" },
						],
					},
				]
			: []),
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		...(sessionFilterControl
			? [
					{
						...sessionFilterControl,
						type: "filter" as const,
						data: [
							{ label: "Active Sessions", value: "active" },
							{ label: "Archived Sessions", value: "archived" },
							{ label: "All Sessions", value: "all" },
						],
						topPriority: true,
					},
				]
			: []),
		{ label: "Name", columnId: "name", type: "sort", topPriority: true },
		{ label: "Start", columnId: "start_datetime", type: "sort" },
		{ label: "End", columnId: "end_datetime", type: "sort" },
		{ label: "Status", columnId: "status", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search seat sessions...",
					enableCustomSearch: false,
					columns: ["name", "location", "id"],
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
