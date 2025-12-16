"use client";

import { useQuery } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import * as React from "react";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import { getEventTicketTypes } from "@/lib/api/ticket-type";

type TicketFilter = "active" | "archived" | "all";

interface DataControlProps<TData> {
	table: Table<TData>;
	labelsData?: Record<string, string>;
	ticketFilter?: TicketFilter;
	onTicketFilterChange?: (filter: TicketFilter) => void;
}

function getColumnLabel(
	columnId: string,
	labelsData?: Record<string, string>,
): string {
	if (columnId.startsWith("custom_")) {
		const labelKey = columnId.replace("custom_", "");
		return labelsData?.[labelKey] || columnId;
	}

	const standardLabels: Record<string, string> = {
		name: "Name",
		ticketTypeName: "Ticket Type",
		status: "Status",
		createdAt: "Created At",
	};

	return standardLabels[columnId] || columnId;
}

export function DataControl<TData>({
	table,
	labelsData,
	ticketFilter = "active",
	onTicketFilterChange,
}: DataControlProps<TData>) {
	const params = useParams();
	const eventId = params.event_id as string;

	const { data: eventTicketTypes } = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});

	const uniqueTicketTypeNames = React.useMemo(() => {
		const names = new Set<string>();
		table.getPreFilteredRowModel().rows.forEach((row) => {
			const typeName = (row.original as Record<string, unknown>)
				?.ticketTypeName;
			if (typeName && typeName !== "N/A") {
				names.add(typeName as string);
			}
		});
		return Array.from(names).sort();
	}, [table]);

	const ticketTypes =
		eventTicketTypes && eventTicketTypes.length > 0
			? eventTicketTypes
			: uniqueTicketTypeNames.map((name) => ({ id: name, name }));

	const getStatusFilterValue = () => {
		const statusFilter = table.getColumn("status")?.getFilterValue() as
			| string
			| undefined;
		return statusFilter ?? "all";
	};

	const getTicketTypeFilterValue = () => {
		const ticketTypeFilter =
			(table.getColumn("ticketTypeName")?.getFilterValue() as string[]) ?? [];
		return ticketTypeFilter.length === 0 ? "all" : ticketTypeFilter[0];
	};

	const ticketFilterControl = onTicketFilterChange
		? {
				label: "Ticket Filter",
				columnId: "ticketFilter",
				customFilter: {
					value: ticketFilter,
					onChange: (value: string) =>
						onTicketFilterChange(value as TicketFilter),
				},
			}
		: null;

	const statusFilterControl: ControlConfig = {
		label: "Status",
		columnId: "status",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			{ label: "Scanned", value: "scanned" },
			{ label: "Not Scanned", value: "not_scanned" },
		],
		customFilter: {
			value: getStatusFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("status");
				column?.setFilterValue(value === "all" ? undefined : value);
			},
		},
	};

	const ticketTypeFilterControl: ControlConfig = {
		label: "Ticket Type",
		columnId: "ticketTypeName",
		type: "filter",
		data: [
			{ label: "All", value: "all" },
			...ticketTypes.map((ticketType) => ({
				label: ticketType.name,
				value: ticketType.name,
			})),
		],
		customFilter: {
			value: getTicketTypeFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("ticketTypeName");
				column?.setFilterValue(value === "all" ? undefined : [value]);
			},
		},
	};

	const desktopControlConfigs: ControlConfig[] = [
		...(ticketFilterControl
			? [
					{
						...ticketFilterControl,
						type: "filter" as const,
						data: [
							{ label: "Active", value: "active" },
							{ label: "Archived", value: "archived" },
							{ label: "All", value: "all" },
						],
					},
				]
			: []),
		statusFilterControl,
		ticketTypeFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel: (columnId) => getColumnLabel(columnId, labelsData),
			excludeColumns: ["phone"],
		},
	];

	const baseMobileSortConfigs: ControlConfig[] = [
		{ label: "Name", columnId: "name", type: "sort" },
		{ label: "Email", columnId: "email", type: "sort" },
		{ label: "Status", columnId: "status", type: "sort" },
		{ label: "Created", columnId: "createdAt", type: "sort" },
	];

	const customMobileSortConfigs = React.useMemo<ControlConfig[]>(() => {
		return table
			.getAllColumns()
			.filter(
				(column) =>
					column.id.startsWith("custom_") &&
					column.getCanSort() &&
					column.getIsVisible(),
			)
			.map((column) => ({
				label: getColumnLabel(column.id, labelsData),
				columnId: column.id,
				type: "sort" as const,
			}));
	}, [labelsData, table]);

	const mobileControlConfigs: ControlConfig[] = [
		...(ticketFilterControl
			? [
					{
						...ticketFilterControl,
						type: "filter" as const,
						data: [
							{ label: "Active Tickets", value: "active" },
							{ label: "Archived Tickets", value: "archived" },
							{ label: "All Tickets", value: "all" },
						],
						topPriority: true,
					},
				]
			: []),
		{ ...statusFilterControl, topPriority: true },
		{ ...ticketTypeFilterControl, topPriority: true },
		...baseMobileSortConfigs,
		...customMobileSortConfigs,
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search tickets...",
					enableCustomSearch: true,
					columns: ["name", "email", "phone", "ticketTypeName"],
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
