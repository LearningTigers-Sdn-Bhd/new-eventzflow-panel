"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface DataControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		full_name: "Full Name",
		company_name: "Company Name",
		email: "Email",
		phone: "Phone",
		status: "Status",
		created_at: "Created At",
	};

	return standardLabels[columnId] || columnId.replace(/_/g, " ");
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const getStatusFilterValue = () => {
		const statusFilter = table.getColumn("status")?.getFilterValue() as
			| string
			| undefined;
		return statusFilter ?? "all";
	};

	const statusFilterControl: ControlConfig = {
		label: "Status",
		columnId: "status",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Active", value: "active" },
			{ label: "Inactive", value: "inactive" },
		],
		customFilter: {
			value: getStatusFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("status");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const desktopControlConfigs: ControlConfig[] = [
		statusFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel,
			excludeColumns: ["actions"],
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ ...statusFilterControl, topPriority: true },
		{ label: "Name", columnId: "full_name", type: "sort" },
		{ label: "Company", columnId: "company_name", type: "sort" },
		{ label: "Email", columnId: "email", type: "sort" },
		{ label: "Status", columnId: "status", type: "sort" },
		{ label: "Created", columnId: "created_at", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search contractors...",
					enableCustomSearch: true,
					columns: ["full_name", "company_name", "email"],
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
