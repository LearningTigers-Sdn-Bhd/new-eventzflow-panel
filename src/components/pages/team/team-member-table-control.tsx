"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface DataControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		full_name: "Name",
		email: "Email",
		phone: "Phone",
		role: "Role",
		status: "Status",
		createdAt: "Created At",
	};

	return standardLabels[columnId] || columnId;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const getRoleFilterValue = () => {
		const roleFilter = table.getColumn("role")?.getFilterValue() as
			| string
			| undefined;
		return roleFilter ?? "all";
	};

	const getStatusFilterValue = () => {
		const statusFilter = table.getColumn("status")?.getFilterValue() as
			| string
			| undefined;
		return statusFilter ?? "all";
	};

	const roleFilterControl: ControlConfig = {
		label: "Role",
		columnId: "role",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Owner", value: "org_owner" },
			{ label: "Organizer", value: "organizer" },
			{ label: "Member", value: "member" },
			{ label: "Vendor", value: "vendor" },
		],
		customFilter: {
			value: getRoleFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("role");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
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
		roleFilterControl,
		statusFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel: getColumnLabel,
			excludeColumns: ["actions"],
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ ...roleFilterControl, topPriority: true },
		{ ...statusFilterControl, topPriority: true },
		{ label: "Name", columnId: "full_name", type: "sort" },
		{ label: "Email", columnId: "email", type: "sort" },
		{ label: "Phone", columnId: "phone", type: "sort" },
		{ label: "Created", columnId: "createdAt", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search team members...",
					enableCustomSearch: true,
					columns: ["full_name", "email", "phone"],
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
