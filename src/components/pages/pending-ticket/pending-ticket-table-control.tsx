"use client";

import { useQuery } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import * as React from "react";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import { getEventTicketTypes } from "@/lib/api/ticket-type";

interface DataControlProps<TData> {
	table: Table<TData>;
	labelsData?: Record<string, string>;
	hasApplicationWorkflow?: boolean;
	onResetColumns?: () => void;
}

const PAYMENT_STATUS_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "pending", label: "Pending" },
	{ value: "completed", label: "Completed" },
	{ value: "failed", label: "Failed" },
	{ value: "approval_pending", label: "Approval Pending" },
	{ value: "rejected", label: "Rejected" },
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

const SEARCH_COLUMNS = [
	"name",
	"email",
	"phone",
	"ticketTypeName",
	"transactionId",
	"reviewStatus",
	"rsvpStatus",
];

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
	hasApplicationWorkflow = true,
	onResetColumns,
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
		if (!hasApplicationWorkflow) return "all";
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
				if (!hasApplicationWorkflow) return;
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
		if (!hasApplicationWorkflow) return "all";
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
				if (!hasApplicationWorkflow) return;
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
		paymentStatusFilterControl,
		...(hasApplicationWorkflow
			? [reviewStatusFilterControl, rsvpStatusFilterControl]
			: []),
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

	const baseMobileSortConfigs: ControlConfig[] = [
		{ label: "Name", columnId: "name", type: "sort" },
		{ label: "Email", columnId: "email", type: "sort" },
		...(hasApplicationWorkflow
			? [
					{
						label: "Review Status",
						columnId: "reviewStatus",
						type: "sort" as const,
					},
					{
						label: "RSVP Status",
						columnId: "rsvpStatus",
						type: "sort" as const,
					},
				]
			: []),
		{ label: "Payment Status", columnId: "paymentStatus", type: "sort" },
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
		{ ...paymentStatusFilterControl, topPriority: true },
		...(hasApplicationWorkflow
			? [
					{ ...reviewStatusFilterControl, topPriority: true },
					{ ...rsvpStatusFilterControl, topPriority: true },
				]
			: []),
		{ ...ticketTypeFilterControl, topPriority: true },
		...baseMobileSortConfigs,
		...customMobileSortConfigs,
	];

	return (
		<BaseTableControl
			table={table}
			searchConfig={{
				searchConfig: {
					placeholder: "Search pending tickets...",
					enableCustomSearch: true,
					columns: hasApplicationWorkflow
						? SEARCH_COLUMNS
						: SEARCH_COLUMNS.filter(
								(column) =>
									column !== "reviewStatus" && column !== "rsvpStatus",
							),
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
