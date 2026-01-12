"use client";

import type { Table } from "@tanstack/react-table";
import * as React from "react";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import type { ScanResult, TypeFilter } from "../types";

interface DataControlProps {
	table: Table<ScanResult>;
	scanResults: ScanResult[];
	filterType: string;
	typeFilter: TypeFilter;
	sortType: "newest" | "oldest" | "status";
	onFilterChange: (filter: string) => void;
	onTypeFilterChange: (filter: TypeFilter) => void;
	onSortChange: (sort: "newest" | "oldest" | "status") => void;
}

export function DataControl({
	table,
	scanResults,
	filterType,
	typeFilter,
	sortType,
	onFilterChange,
	onTypeFilterChange,
	onSortChange,
}: DataControlProps) {
	// Get unique events for filter
	const uniqueEvents = React.useMemo(
		() =>
			Array.from(
				new Map(
					scanResults
						.filter((r) => r.eventId && r.eventName)
						.map((r) => [r.eventId, r.eventName]),
				).entries(),
			).map(([id, name]) => ({ id: id?.toString() ?? "", name: name ?? "" })),
		[scanResults],
	);

	// Handle sort change - map to TanStack Table sorting
	const handleSortChange = (value: "newest" | "oldest" | "status") => {
		onSortChange(value);
		const timestampColumn = table.getColumn("timestamp");
		const statusColumn = table.getColumn("status");

		// Clear existing sorting
		table.resetSorting();

		if (value === "newest") {
			timestampColumn?.toggleSorting(true); // desc = newest first
		} else if (value === "oldest") {
			timestampColumn?.toggleSorting(false); // asc = oldest first
		} else if (value === "status") {
			statusColumn?.toggleSorting(false); // asc
		}
	};

	// Handle filter change - map to TanStack Table filter
	const handleFilterChange = (value: string) => {
		onFilterChange(value);
		const eventColumn = table.getColumn("eventName");

		if (value === "all") {
			eventColumn?.setFilterValue(undefined);
		} else {
			// Filter by event ID (uses filterFn in column definition)
			eventColumn?.setFilterValue(value);
		}
	};

	// Handle type filter change
	const handleTypeFilterChange = (value: string) => {
		onTypeFilterChange(value as TypeFilter);
		const typeColumn = table.getColumn("type");

		if (value === "all") {
			typeColumn?.setFilterValue(undefined);
		} else {
			typeColumn?.setFilterValue(value);
		}
	};

	if (scanResults.length === 0) {
		return null;
	}

	// Type filter control (Ticket/Visitor)
	const typeFilterControl: ControlConfig = {
		label: "Type",
		columnId: "type",
		type: "filter",
		data: [
			{ label: "All Types", value: "all" },
			{ label: "Ticket", value: "ticket" },
			{ label: "Visitor", value: "visitor" },
		],
		customFilter: {
			value: typeFilter,
			onChange: handleTypeFilterChange,
		},
	};

	// Event filter control
	const eventFilterControl: ControlConfig = {
		label: "Event Filter",
		columnId: "eventName",
		type: "filter",
		data: [
			{ label: "All Events", value: "all" },
			...uniqueEvents.map((event) => ({
				label: event.name,
				value: event.id,
			})),
		],
		customFilter: {
			value: filterType,
			onChange: handleFilterChange,
		},
	};

	// Sort control - uses customFilter since these are not actual column IDs
	const sortControl: ControlConfig = {
		label: "Sort",
		columnId: "sort",
		type: "filter",
		data: [
			{ label: "Newest First", value: "newest" },
			{ label: "Oldest First", value: "oldest" },
			{ label: "By Status", value: "status" },
		],
		customFilter: {
			value: sortType,
			onChange: (value: string) =>
				handleSortChange(value as "newest" | "oldest" | "status"),
		},
	};

	const desktopControlConfigs: ControlConfig[] = [
		typeFilterControl,
		eventFilterControl,
		sortControl,
	];

	const mobileControlConfigs: ControlConfig[] = [
		{ ...typeFilterControl, topPriority: true },
		{ ...eventFilterControl, topPriority: true },
		{ ...sortControl, topPriority: true },
		{ label: "Attendee", columnId: "name", type: "sort" },
		{ label: "Event", columnId: "eventName", type: "sort" },
		{ label: "Check-In Time", columnId: "timestamp", type: "sort" },
		{ label: "Status", columnId: "status", type: "sort" },
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search names, IDs, events...",
					enableCustomSearch: true,
					columns: ["name", "scanId", "eventName", "ticketType"],
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
