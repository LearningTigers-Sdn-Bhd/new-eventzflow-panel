"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface DrawSessionTableControlProps<TData> {
	table: Table<TData>;
	searchPlaceholder?: string;
}

/**
 * Generic table control component for draw session tables
 * Used by both roulette and lucky-draw tables
 */
export function DrawSessionTableControl<TData>({
	table,
	searchPlaceholder = "Search sessions...",
}: DrawSessionTableControlProps<TData>) {
	const desktopControlConfigs: ControlConfig[] = [
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel: (columnId) => columnId.replace(/_/g, " "),
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ label: "Title", columnId: "title", type: "sort" },
		{ label: "Draw Date", columnId: "draw_date", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: searchPlaceholder,
					enableCustomSearch: true,
					columns: ["title"],
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
