"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface DataControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		full_name: "Vendor Name",
		email: "Email",
		type: "Type",
		redirect_url: "Redirect URL",
		poster_url: "Poster URL",
		created_at: "Added At",
	};

	return standardLabels[columnId] || columnId;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const getTypeFilterValue = () => {
		const typeFilter = table.getColumn("type")?.getFilterValue() as
			| string
			| undefined;
		return typeFilter ?? "all";
	};

	const typeFilterControl: ControlConfig = {
		label: "Type",
		columnId: "type",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Exhibitor", value: "Exhibitor" },
			{ label: "Merchant", value: "Merchant" },
		],
		customFilter: {
			value: getTypeFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("type");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const desktopControlConfigs: ControlConfig[] = [
		typeFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel,
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ ...typeFilterControl, topPriority: true },
		{ label: "Vendor Name", columnId: "full_name", type: "sort" },
		{ label: "Email", columnId: "email", type: "sort" },
		{ label: "Added At", columnId: "created_at", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search event vendors...",
					enableCustomSearch: true,
					columns: ["full_name", "email"],
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
