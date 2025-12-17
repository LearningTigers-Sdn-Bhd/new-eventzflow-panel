"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface DataControlProps<TData> {
	table: Table<TData>;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const getStatusFilterValue = () => {
		const statusFilter = table.getColumn("status")?.getFilterValue() as
			| string
			| undefined;
		return statusFilter ?? "all";
	};

	const getEventRoleFilterValue = () => {
		const eventRoleFilter = table.getColumn("eventRole")?.getFilterValue() as
			| string
			| undefined;
		return eventRoleFilter ?? "all";
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

	const eventRoleFilterControl: ControlConfig = {
		label: "Event Role",
		columnId: "eventRole",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Admin", value: "event_admin" },
			{ label: "Team Member", value: "event_team_member" },
		],
		customFilter: {
			value: getEventRoleFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("eventRole");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const desktopControlConfigs: ControlConfig[] = [
		statusFilterControl,
		eventRoleFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel: (columnId) => {
				const standardLabels: Record<string, string> = {
					full_name: "Name",
					email: "Email",
					phone: "Phone",
					eventRole: "Event Role",
					status: "Status",
					createdAt: "Assigned At",
				};
				return standardLabels[columnId] || columnId;
			},
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ ...statusFilterControl, topPriority: true },
		{ ...eventRoleFilterControl, topPriority: true },
		{ label: "Name", columnId: "full_name", type: "sort" },
		{ label: "Email", columnId: "email", type: "sort" },
		{ label: "Status", columnId: "status", type: "sort" },
		{ label: "Assigned", columnId: "createdAt", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search event staff...",
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
