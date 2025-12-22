"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import type { Visitor } from "@/lib/api/visitor";

interface DataControlProps {
	table: Table<Visitor>;
	eventId: number;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		full_name: "Name",
		email: "Email",
		public_id: "Public ID",
		created_at: "Created At",
	};

	return standardLabels[columnId] || columnId;
}

export function DataControl({ table, eventId: _eventId }: DataControlProps) {
	const desktopControlConfigs: ControlConfig[] = [
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel: (columnId) => getColumnLabel(columnId),
			excludeColumns: ["phone"],
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ label: "Name", columnId: "full_name", type: "sort" },
		{ label: "Email", columnId: "email", type: "sort" },
		{ label: "Created", columnId: "created_at", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search visitors...",
					enableCustomSearch: false,
					columns: ["full_name", "email", "phone", "public_id"],
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
