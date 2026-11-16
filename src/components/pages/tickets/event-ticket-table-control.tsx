"use client";

import { useQuery } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import * as React from "react";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import { getEventById } from "@/lib/api/event";
import { getTicketGroups } from "@/lib/api/ticket-group";
import { getEventTicketTypes } from "@/lib/api/ticket-type";

type TicketFilter = "active" | "archived" | "all";

interface DataControlProps<TData> {
	table: Table<TData>;
	labelsData?: Record<string, string>;
	ticketFilter?: TicketFilter;
	onTicketFilterChange?: (filter: TicketFilter) => void;
	onResetColumns?: () => void;
	search: string;
	onSearchChange: (value: string) => void;
}

function getColumnLabel(
	columnId: string,
	labelsData?: Record<string, string>,
): string {
	if (columnId === "custom_participation_category") {
		return labelsData?.participation_category || "Category";
	}

	if (columnId.startsWith("custom_")) {
		const labelKey = columnId.replace("custom_", "");
		return labelsData?.[labelKey] || columnId;
	}

	const standardLabels: Record<string, string> = {
		name: "Name",
		ticketTypeName: "Ticket Type",
		ticketGroup: "Group",
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
	onResetColumns,
	search,
	onSearchChange,
}: DataControlProps<TData>) {
	const params = useParams();
	const eventId = params.event_id as string;

	const { data: eventTicketTypes } = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});

	const { data: eventData } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});
	const { data: groupData } = useQuery({
		queryKey: ["ticket-groups", eventId],
		queryFn: () => getTicketGroups(eventId),
		enabled: eventData?.use_ticket_groups === true,
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

	const ticketTypes = React.useMemo(() => {
		const source =
			eventTicketTypes && eventTicketTypes.length > 0
				? eventTicketTypes
				: uniqueTicketTypeNames.map((name) => ({ id: name, name }));

		// Ticket type names aren't guaranteed unique (e.g. an archived type
		// renamed to match an active one) — the filter only ever matches
		// against the ticketTypeName string column, so dedupe by name here
		// rather than rendering two options with the same key/value.
		const seenNames = new Set<string>();
		return source.filter(({ name }) => {
			if (seenNames.has(name)) return false;
			seenNames.add(name);
			return true;
		});
	}, [eventTicketTypes, uniqueTicketTypeNames]);

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

	const getGroupFilterValue = () =>
		(table.getColumn("ticketGroup")?.getFilterValue() as string | undefined) ??
		"all";

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

	// Only offered once groups exist, so events not using groups see no change.
	const groupFilterControls: ControlConfig[] = groupData?.groups.length
		? [
				{
					label: "Group",
					columnId: "ticketGroup",
					type: "filter",
					data: [
						{ label: "All", value: "all" },
						{ label: "No group", value: "none" },
						...groupData.groups.map((g) => ({
							label: g.name,
							value: String(g.id),
						})),
					],
					customFilter: {
						value: getGroupFilterValue(),
						onChange: (value: string) => {
							table
								.getColumn("ticketGroup")
								?.setFilterValue(value === "all" ? undefined : value);
						},
					},
				},
			]
		: [];

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
		...groupFilterControls,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel: (columnId) => getColumnLabel(columnId, labelsData),
			excludeColumns: ["phone"],
			onReset: onResetColumns,
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
		...groupFilterControls,
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
					controlled: { value: search, onChange: onSearchChange },
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
