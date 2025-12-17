"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface ApiKeyTableControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		name: "Name",
		isActive: "Status",
		lastUsedAt: "Last Used",
		createdAt: "Created At",
	};

	return standardLabels[columnId] || columnId;
}

export function ApiKeyTableControl<TData>({
	table,
}: ApiKeyTableControlProps<TData>) {
	const getStatusFilterValue = () => {
		const statusFilter = table.getColumn("isActive")?.getFilterValue() as
			| boolean
			| undefined;
		return statusFilter === undefined
			? "all"
			: statusFilter
				? "active"
				: "revoked";
	};

	const statusFilterControl: ControlConfig = {
		label: "Status",
		columnId: "isActive",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Active", value: "active" },
			{ label: "Revoked", value: "revoked" },
		],
		customFilter: {
			value: getStatusFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("isActive");
				if (value === "all") {
					column?.setFilterValue(undefined);
				} else {
					column?.setFilterValue(value === "active");
				}
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
			excludeColumns: [],
		},
	];

	const baseMobileSortConfigs: ControlConfig[] = [
		{ label: "Name", columnId: "name", type: "sort" },
		{ label: "Status", columnId: "isActive", type: "sort" },
		{ label: "Last Used", columnId: "lastUsedAt", type: "sort" },
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
					placeholder: "Search API keys...",
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
