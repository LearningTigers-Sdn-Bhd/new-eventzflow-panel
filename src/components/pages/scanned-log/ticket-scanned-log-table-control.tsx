"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";

interface DataControlProps<TData> {
	table: Table<TData>;
	search: string;
	onSearchChange: (value: string) => void;
	source: string;
	onSourceChange: (value: string) => void;
	ticketTypeId: string;
	onTicketTypeIdChange: (value: string) => void;
	ticketTypeOptions: { label: string; value: string }[];
}

export function DataControl<TData>({
	table,
	search,
	onSearchChange,
	source,
	onSourceChange,
	ticketTypeId,
	onTicketTypeIdChange,
	ticketTypeOptions,
}: DataControlProps<TData>) {
	const sourceFilterControl: ControlConfig = {
		label: "Source",
		columnId: "source",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Staff scan", value: "staff_scan" },
			{ label: "Self check-in", value: "self_check_in" },
			{ label: "Public Check-in Page", value: "kiosk" },
		],
		customFilter: {
			value: source,
			onChange: onSourceChange,
		},
	};

	const ticketTypeFilterControl: ControlConfig = {
		label: "Ticket Type",
		columnId: "ticketTypeName",
		type: "filter",
		data: [{ label: "All", value: "all" }, ...ticketTypeOptions],
		customFilter: {
			value: ticketTypeId,
			onChange: onTicketTypeIdChange,
		},
	};

	const mobileControlConfigs: ControlConfig[] = [
		{ ...sourceFilterControl, topPriority: true },
		{ ...ticketTypeFilterControl, topPriority: true },
		{ label: "Name", columnId: "name", type: "sort" },
		{ label: "Location", columnId: "locationName", type: "sort" },
		{ label: "Scanned By", columnId: "scannedBy", type: "sort" },
		{ label: "Scanned At", columnId: "scannedAt", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search scanned logs...",
					enableCustomSearch: true,
					controlled: { value: search, onChange: onSearchChange },
				},
			}}
			desktopConfig={{
				controlConfigs: [sourceFilterControl, ticketTypeFilterControl],
			}}
			mobileConfig={{ controlConfigs: mobileControlConfigs }}
		/>
	);
}
