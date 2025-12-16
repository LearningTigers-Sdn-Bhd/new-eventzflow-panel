"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/mobile-table-control";

interface DataControlProps<TData> {
	table: Table<TData>;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	// Mobile control configuration
	const mobileControlConfigs: ControlConfig[] = [
		{
			label: "Name",
			columnId: "name",
			type: "sort",
		},
		{
			label: "Floor",
			columnId: "floor",
			type: "sort",
		},
		{
			label: "Staff",
			columnId: "staffCount",
			type: "sort",
		},
		{
			label: "Vendors",
			columnId: "vendorCount",
			type: "sort",
		},
	];

	return (
		<BaseTableControl
			table={table}
			desktopConfig={{
				searchPlaceholder: "Search locations...",
				searchColumns: ["name", "id"],
				controlConfigs: [],
			}}
			mobileConfig={{
				searchPlaceholder: "Search locations...",
				searchColumns: ["name", "id"],
				controlConfigs: mobileControlConfigs,
			}}
		/>
	);
}
