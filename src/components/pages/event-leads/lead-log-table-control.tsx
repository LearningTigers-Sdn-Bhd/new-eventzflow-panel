"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface DataControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		lead_name: "Attendee",
		leadable_type: "Type",
		contact: "Contact",
		vendor_name: "Captured By",
		created_at: "Captured At",
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
		{ label: "Attendee", columnId: "lead_name", type: "sort" },
		{ label: "Captured By", columnId: "vendor_name", type: "sort" },
		{ label: "Captured At", columnId: "created_at", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search by name, email, phone...",
					enableCustomSearch: true,
					columns: [
						"lead_name",
						"lead_email",
						"lead_phone",
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
