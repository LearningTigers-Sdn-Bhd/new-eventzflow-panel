"use client";

import type { Table } from "@tanstack/react-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/mobile-table-control";
import {
	EVENT_FILTER_OPTIONS,
	EVENT_FILTER_OPTIONS_MOBILE,
	EVENT_STATUS_OPTIONS,
	type EventFilter,
} from "@/lib/constants/event-constants";

interface DataControlProps<TData> {
	table: Table<TData>;
	eventFilter?: EventFilter;
	onEventFilterChange?: (filter: EventFilter) => void;
}

export function DataControl<TData>({
	table,
	eventFilter = "active",
	onEventFilterChange,
}: DataControlProps<TData>) {
	const eventFilterControl = onEventFilterChange
		? {
				label: "Event Filter",
				columnId: "eventFilter",
				customFilter: {
					value: eventFilter,
					onChange: (value: string) =>
						onEventFilterChange(value as EventFilter),
				},
			}
		: null;

	// Desktop control configuration
	const desktopControlConfigs: ControlConfig[] = eventFilterControl
		? [
				{
					...eventFilterControl,
					type: "filter",
					data: EVENT_FILTER_OPTIONS,
				},
			]
		: [];

	// Mobile control configuration
	const mobileControlConfigs: ControlConfig[] = [
		...(eventFilterControl
			? [
					{
						...eventFilterControl,
						type: "filter" as const,
						data: EVENT_FILTER_OPTIONS_MOBILE,
						topPriority: true,
					},
				]
			: []),
		{
			label: "ID",
			columnId: "id",
			type: "sort",
		},
		{
			label: "Title",
			columnId: "title",
			type: "sort",
		},
		{
			label: "Created At",
			columnId: "created_at",
			type: "sort",
		},
		{
			label: "Status",
			columnId: "status",
			type: "filter",
			data: EVENT_STATUS_OPTIONS.filter((opt) => opt.value !== "completed"),
		},
	];

	return (
		<BaseTableControl
			table={table}
			desktopConfig={{
				searchPlaceholder: "Search events...",
				searchColumns: ["title", "id"],
				controlConfigs: desktopControlConfigs,
			}}
			mobileConfig={{
				searchPlaceholder: "Search events...",
				searchColumns: ["title", "id"],
				controlConfigs: mobileControlConfigs,
			}}
		/>
	);
}
