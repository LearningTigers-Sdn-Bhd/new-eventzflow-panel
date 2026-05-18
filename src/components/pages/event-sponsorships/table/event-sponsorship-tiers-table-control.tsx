"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";

interface DataControlProps<TData> {
	table: Table<TData>;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search tiers...",
					columns: ["name"],
					enableCustomSearch: false,
				},
			}}
			desktopConfig={{
				controlConfigs: [],
			}}
			mobileConfig={{
				controlConfigs: [],
			}}
		/>
	);
}
