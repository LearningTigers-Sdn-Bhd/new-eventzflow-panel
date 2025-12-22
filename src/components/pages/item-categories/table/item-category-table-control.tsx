"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface DataControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		name: "Name",
		active: "Status",
		createdAt: "Created At",
	};

	return standardLabels[columnId] || columnId;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const getStatusFilterValue = () => {
		const statusFilter = table.getColumn("active")?.getFilterValue() as
			| boolean
			| undefined;
		return statusFilter === undefined
			? "all"
			: statusFilter
				? "active"
				: "inactive";
	};

	const statusFilterControl: ControlConfig = {
		label: "Status",
		columnId: "active",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Active", value: "active" },
			{ label: "Inactive", value: "inactive" },
		],
		customFilter: {
			value: getStatusFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("active");
				column?.setFilterValue(
					value === "all" ? undefined : value === "active",
				);
			},
		},
	};

	const desktopControlConfigs: ControlConfig[] = [
		statusFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel: (columnId) => getColumnLabel(columnId),
		},
	];

	const baseMobileSortConfigs: ControlConfig[] = [
		{ label: "Name", columnId: "name", type: "sort" },
		{ label: "Status", columnId: "active", type: "sort" },
		{ label: "Created", columnId: "createdAt", type: "sort" },
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ ...statusFilterControl, topPriority: true },
		...baseMobileSortConfigs,
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search categories...",
					enableCustomSearch: true,
					columns: ["name"],
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
