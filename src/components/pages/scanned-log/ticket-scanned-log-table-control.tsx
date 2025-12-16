"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface DataControlProps<TData> {
	table: Table<TData>;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const statusFilterControl: ControlConfig = {
		label: "Status",
		columnId: "status",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Scanned", value: "scanned" },
			{ label: "Not Scanned", value: "not_scanned" },
		],
		customFilter: {
			value: (table.getColumn("status")?.getFilterValue() as string) ?? "all",
			onChange: (value: string) => {
				const column = table.getColumn("status");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const desktopControlConfigs: ControlConfig[] = [statusFilterControl];

	const mobileControlConfigs: ControlConfig[] = [
		{ ...statusFilterControl, topPriority: true },
		{ label: "Name", columnId: "name", type: "sort" },
		{ label: "Location", columnId: "locationName", type: "sort" },
		{ label: "Scanned By", columnId: "scannedBy", type: "sort" },
		{ label: "Check-In Time", columnId: "checkedInAt", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search scanned logs...",
					enableCustomSearch: true,
					columns: ["name", "email", "phone", "locationName", "scannedBy"],
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
