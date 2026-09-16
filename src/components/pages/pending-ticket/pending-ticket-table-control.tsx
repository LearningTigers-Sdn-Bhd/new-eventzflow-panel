"use client";

import { useQuery } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import * as React from "react";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import { getEventTicketTypes } from "@/lib/api/ticket-type";

type PendingTicketFilter = "active" | "archived" | "all";

interface DataControlProps<TData> {
	table: Table<TData>;
	labelsData?: Record<string, string>;
	pendingTicketFilter?: PendingTicketFilter;
	onPendingTicketFilterChange?: (filter: PendingTicketFilter) => void;
	onResetColumns?: () => void;
	search: string;
	onSearchChange: (value: string) => void;
}

// Matches the real payment_status enum values this tab shows (see
// PENDING_PAYMENT_STATUSES in lib/api/event/pending/endpoints.ts) — "paid"
// is excluded by the base query, not offered as a sub-filter here.
const PAYMENT_STATUS_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "pending", label: "Pending" },
	{ value: "failed", label: "Failed" },
	{ value: "refunded_payment", label: "Refunded" },
] as const;

const REVIEW_STATUS_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "pending_review", label: "Pending Review" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
] as const;

const RSVP_STATUS_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "not_sent", label: "Not Sent" },
	{ value: "sent", label: "Sent" },
	{ value: "confirmed", label: "Confirmed" },
	{ value: "declined", label: "Declined" },
	{ value: "expired", label: "Expired" },
] as const;

// Search runs server-side (the `q` param) against attendee name/email/phone
// and ticket type name — see tickets_controller.rb#search_tickets. Custom
// fields also match server-side but aren't listed here since they're
// per-event, not fixed columns.
const SEARCH_COLUMNS = ["name", "email", "phone", "ticketTypeName"];

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
		email: "Email",
		ticketTypeName: "Ticket Type",
		paymentStatus: "Payment Status",
		reviewStatus: "Review Status",
		rsvpStatus: "RSVP Status",
		transactionId: "Transaction ID",
		createdAt: "Created At",
	};

	return standardLabels[columnId] || columnId;
}

export function DataControl<TData>({
	table,
	labelsData,
	pendingTicketFilter = "active",
	onPendingTicketFilterChange,
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

	// Static active/archived/all enum — rendered synchronously from local
	// state (no fetch), so the toolbar filter is populated on first paint.
	const pendingTicketFilterControl = onPendingTicketFilterChange
		? {
				label: "Ticket Filter",
				columnId: "pendingTicketFilter",
				customFilter: {
					value: pendingTicketFilter,
					onChange: (value: string) =>
						onPendingTicketFilterChange(value as PendingTicketFilter),
				},
			}
		: null;

	const getPaymentStatusFilterValue = () => {
		const paymentStatusFilter =
			(table.getColumn("paymentStatus")?.getFilterValue() as string[]) ?? [];

		return paymentStatusFilter.length === 0 ? "all" : paymentStatusFilter[0];
	};

	const getTicketTypeFilterValue = () => {
		const ticketTypeFilter =
			(table.getColumn("ticketTypeName")?.getFilterValue() as string[]) ?? [];
		return ticketTypeFilter.length === 0 ? "all" : ticketTypeFilter[0];
	};

	const paymentStatusFilterControl: ControlConfig = {
		label: "Payment Status",
		columnId: "paymentStatus",
		type: "filter",
		data: PAYMENT_STATUS_OPTIONS.map((option) => ({
			label: option.label,
			value: option.value,
		})),
		customFilter: {
			value: getPaymentStatusFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("paymentStatus");
				if (!column) return;

				if (value === "all") {
					column.setFilterValue(undefined);
					return;
				}

				column.setFilterValue([value]);
			},
		},
	};

	const getReviewStatusFilterValue = () => {
		const reviewStatusFilter =
			(table.getColumn("reviewStatus")?.getFilterValue() as string[]) ?? [];
		return reviewStatusFilter.length === 0 ? "all" : reviewStatusFilter[0];
	};

	const reviewStatusFilterControl: ControlConfig = {
		label: "Review Status",
		columnId: "reviewStatus",
		type: "filter",
		data: REVIEW_STATUS_OPTIONS.map((option) => ({
			label: option.label,
			value: option.value,
		})),
		customFilter: {
			value: getReviewStatusFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("reviewStatus");
				if (!column) return;

				if (value === "all") {
					column.setFilterValue(undefined);
					return;
				}

				column.setFilterValue([value]);
			},
		},
	};

	const getRsvpStatusFilterValue = () => {
		const rsvpStatusFilter =
			(table.getColumn("rsvpStatus")?.getFilterValue() as string[]) ?? [];
		return rsvpStatusFilter.length === 0 ? "all" : rsvpStatusFilter[0];
	};

	const rsvpStatusFilterControl: ControlConfig = {
		label: "RSVP Status",
		columnId: "rsvpStatus",
		type: "filter",
		data: RSVP_STATUS_OPTIONS.map((option) => ({
			label: option.label,
			value: option.value,
		})),
		customFilter: {
			value: getRsvpStatusFilterValue(),
			onChange: (value: string) => {
				const column = table.getColumn("rsvpStatus");
				if (!column) return;

				if (value === "all") {
					column.setFilterValue(undefined);
					return;
				}

				column.setFilterValue([value]);
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
				if (!column) return;

				if (value === "all") {
					column.setFilterValue(undefined);
					return;
				}

				column.setFilterValue([value]);
			},
		},
	};

	const desktopControlConfigs: ControlConfig[] = [
		...(pendingTicketFilterControl
			? [
					{
						...pendingTicketFilterControl,
						type: "filter" as const,
						data: [
							{ label: "Active", value: "active" },
							{ label: "Archived", value: "archived" },
							{ label: "All", value: "all" },
						],
					},
				]
			: []),
		paymentStatusFilterControl,
		reviewStatusFilterControl,
		rsvpStatusFilterControl,
		ticketTypeFilterControl,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel: (columnId) => getColumnLabel(columnId, labelsData),
			excludeColumns: ["phone"],
			onReset: onResetColumns,
		},
	];

	// Sort options are limited to what the backend's SORTABLE_COLUMNS
	// actually supports (name/email/status/createdAt) — sorting is
	// server-side now, so a column the backend can't order by would silently
	// no-op instead of sorting. See tickets_controller.rb's sort_order.
	const mobileSortConfigs: ControlConfig[] = [
		{ label: "Name", columnId: "name", type: "sort" },
		{ label: "Email", columnId: "email", type: "sort" },
		{ label: "Created", columnId: "createdAt", type: "sort" },
	];

	const mobileControlConfigs: ControlConfig[] = [
		...(pendingTicketFilterControl
			? [
					{
						...pendingTicketFilterControl,
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
		{ ...paymentStatusFilterControl, topPriority: true },
		{ ...reviewStatusFilterControl, topPriority: true },
		{ ...rsvpStatusFilterControl, topPriority: true },
		{ ...ticketTypeFilterControl, topPriority: true },
		...mobileSortConfigs,
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search pending tickets...",
					enableCustomSearch: true,
					columns: SEARCH_COLUMNS,
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
