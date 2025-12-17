"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface DataControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		visitor_name: "Visitor",
		contact: "Contact",
		vendor_name: "Stamped By",
		created_at: "Stamped At",
	};

	return standardLabels[columnId] || columnId;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const desktopControlConfigs: ControlConfig[] = [
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel: (columnId) => getColumnLabel(columnId),
			excludeColumns: ["view"],
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ label: "Visitor", columnId: "visitor_name", type: "sort" },
		{ label: "Stamped By", columnId: "vendor_name", type: "sort" },
		{ label: "Stamped At", columnId: "created_at", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search by name, email, phone...",
					enableCustomSearch: true,
					columns: [
						"visitor_name",
						"visitor_email",
						"visitor_phone",
						"vendor_name",
					],
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
