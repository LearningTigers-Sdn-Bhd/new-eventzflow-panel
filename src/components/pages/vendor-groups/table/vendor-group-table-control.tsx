"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";

interface DataControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const labels: Record<string, string> = {
		name: "Name",
		description: "Description",
		created_at: "Created At",
	};
	return labels[columnId] || columnId;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const desktopControlConfigs = [
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility" as const,
			getColumnLabel,
			excludeColumns: [],
		},
	];

	const mobileControlConfigs = [
		{ label: "Name", columnId: "name", type: "sort" as const },
		{ label: "Created", columnId: "created_at", type: "sort" as const },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search groups...",
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
