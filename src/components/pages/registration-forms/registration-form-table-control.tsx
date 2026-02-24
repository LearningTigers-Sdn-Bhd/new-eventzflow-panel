"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface DataControlProps<TData> {
	table: Table<TData>;
}

function getColumnLabel(columnId: string): string {
	const labels: Record<string, string> = {
		name: "Name",
		slug: "Slug",
		ticketTypes: "Ticket Types",
		position: "Position",
	};

	return labels[columnId] || columnId;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const getTicketTypeFilterValue = () => {
		const ticketTypeFilter = table.getColumn("ticketTypes")?.getFilterValue() as
			| string
			| undefined;
		return ticketTypeFilter ?? "all";
	};

	const ticketTypeFilterControl: ControlConfig = {
		label: "Ticket Types",
		columnId: "ticketTypes",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Mapped", value: "mapped" },
			{ label: "Unmapped", value: "unmapped" },
		],
		customFilter: {
			value: getTicketTypeFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("ticketTypes");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const desktopControlConfigs: ControlConfig[] = [
		ticketTypeFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel,
			excludeColumns: ["actions"],
		},
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ ...ticketTypeFilterControl, topPriority: true },
		{ label: "Name", columnId: "name", type: "sort" },
		{ label: "Slug", columnId: "slug", type: "sort" },
		{ label: "Position", columnId: "position", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search registration forms...",
					enableCustomSearch: true,
					columns: ["name", "slug"],
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
