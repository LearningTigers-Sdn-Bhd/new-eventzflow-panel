"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface ExportLogTableControlProps<TData> {
	table: Table<TData>;
}

export function ExportLogTableControl<TData>({
	table,
}: ExportLogTableControlProps<TData>) {
	const getTypeFilterValue = () => {
		const typeFilter =
			(table.getColumn("type")?.getFilterValue() as string[]) ?? [];
		return typeFilter.length === 0 ? "all" : typeFilter[0];
	};

	const typeFilterControl: ControlConfig = {
		label: "Type",
		columnId: "type",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Ticket List", value: "ticket-list" },
			{ label: "Scan History", value: "scan_history" },
		],
		customFilter: {
			value: getTypeFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("type");
				column?.setFilterValue(value === "all" ? undefined : [value]);
			},
		},
	};

	const desktopControlConfigs: ControlConfig[] = [
		typeFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ ...typeFilterControl, topPriority: true },
		{ label: "Export ID", columnId: "id", type: "sort" },
		{ label: "Type", columnId: "type", type: "sort" },
		{ label: "Created", columnId: "createdAt", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search export logs...",
					enableCustomSearch: false,
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
