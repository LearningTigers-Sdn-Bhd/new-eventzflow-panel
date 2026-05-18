"use client";

import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface PermissionsTableControlProps<TData> {
	table: Table<TData>;
}

export function PermissionsTableControl<TData>({
	table,
}: PermissionsTableControlProps<TData>) {
	const statusFilterValue =
		(table.getColumn("status")?.getFilterValue() as string | undefined) ??
		"all";

	const isOfficialFilterValue = (() => {
		const filterValue = table.getColumn("isOfficial")?.getFilterValue();
		if (filterValue === undefined) return "all";
		return String(filterValue);
	})();

	const statusFilterControl: ControlConfig = useMemo(
		() => ({
			label: "Status",
			columnId: "status",
			type: "filter",
			data: [
				{ label: "All", value: "all" },
				{ label: "Regular", value: "base" },
				{ label: "Partnership", value: "partnership" },
			],
			customFilter: {
				value: statusFilterValue,
				onChange: (value: string) => {
					const column = table.getColumn("status");
					column?.setFilterValue(value === "all" ? undefined : value);
				},
			},
		}),
		[statusFilterValue, table],
	);

	const isOfficialFilterControl: ControlConfig = useMemo(
		() => ({
			label: "Official",
			columnId: "isOfficial",
			type: "filter",
			data: [
				{ label: "All", value: "all" },
				{ label: "Yes", value: "true" },
				{ label: "No", value: "false" },
			],
			customFilter: {
				value: isOfficialFilterValue,
				onChange: (value: string) => {
					const column = table.getColumn("isOfficial");
					if (value === "all") {
						column?.setFilterValue(undefined);
					} else {
						column?.setFilterValue(value === "true");
					}
				},
			},
		}),
		[isOfficialFilterValue, table],
	);

	const desktopControlConfigs: ControlConfig[] = useMemo(
		() => [
			statusFilterControl,
			isOfficialFilterControl,
			{
				label: "Columns",
				columnId: "visibility",
				type: "visibility",
				getColumnLabel: (columnId) => {
					const standardLabels: Record<string, string> = {
						fullName: "Name",
						email: "Email",
						phone: "Phone",
						status: "Status",
						isOfficial: "Official",
						createdAt: "Created At",
					};
					return standardLabels[columnId] || columnId;
				},
			},
		],
		[statusFilterControl, isOfficialFilterControl],
	);

	const mobileControlConfigs: ControlConfig[] = useMemo(
		() => [
			{ ...statusFilterControl, topPriority: true },
			{ ...isOfficialFilterControl, topPriority: true },
			{ label: "Name", columnId: "fullName", type: "sort" },
			{ label: "Email", columnId: "email", type: "sort" },
			{ label: "Status", columnId: "status", type: "sort" },
			{ label: "Created", columnId: "createdAt", type: "sort" },
		],
		[statusFilterControl, isOfficialFilterControl],
	);

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search permissions...",
					enableCustomSearch: true,
					columns: ["fullName", "email", "phone"],
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
