"use client";

import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface LeadsTableControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		lead: "Lead",
		company: "Company",
		location: "Location",
		resource: "Resource",
		createdAt: "Submitted",
	};

	return standardLabels[columnId] || columnId;
}

export function LeadsTableControl<TData>({
	table,
}: LeadsTableControlProps<TData>) {
	const desktopControlConfigs: ControlConfig[] = useMemo(
		() => [
			{
				label: "Columns",
				columnId: "visibility",
				type: "visibility",
				getColumnLabel,
				excludeColumns: [],
			},
		],
		[],
	);

	const mobileControlConfigs: ControlConfig[] = useMemo(() => [], []);

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search leads by name, email, or company...",
					enableCustomSearch: true,
					columns: ["name", "email", "company"],
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
