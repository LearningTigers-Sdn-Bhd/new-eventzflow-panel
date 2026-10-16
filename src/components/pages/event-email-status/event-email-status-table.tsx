"use client";

import {
	getCoreRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { MailCheck } from "lucide-react";
import * as React from "react";
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { BaseTableControl } from "@/components/admin-ui/table/control/base-table-control";
import type { ControlConfig } from "@/components/admin-ui/table/control/type";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import type { EventEmailDelivery } from "@/lib/api/event-email-status";
import { emailTypeLabel, problemReason } from "./email-status-labels";
import {
	EmailStatusActions,
	type EventEmailTableMeta,
	eventEmailStatusColumns,
	StatusBadge,
} from "./event-email-status-columns";

interface EventEmailStatusTableProps {
	data: EventEmailDelivery[];
	meta: EventEmailTableMeta;
	search: string;
	onSearchChange: (value: string) => void;
	emailType: string;
	emailTypes: string[];
	onEmailTypeChange: (value: string) => void;
	pagination: {
		pageIndex: number;
		pageSize: number;
		pageCount: number;
		totalCount: number;
		onPageChange: (pageIndex: number) => void;
		onPageSizeChange: (size: number) => void;
	};
}

const COLUMN_LABELS: Record<string, string> = {
	recipient: "Attendee",
	emailType: "Email",
	status: "Status",
	createdAt: "Sent At",
	actions: "Actions",
};

function EmailStatusCard({
	item,
	meta,
}: {
	item: EventEmailDelivery;
	meta: EventEmailTableMeta;
}) {
	const reason = problemReason(item.status, item.problem);
	return (
		<div className="space-y-2 rounded-none border border-dashed p-3">
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<p className="font-medium text-sm">{item.attendee?.name ?? "-"}</p>
					<p className="break-all text-muted-foreground text-xs">
						{item.recipient || "-"}
					</p>
				</div>
				<StatusBadge status={item.status} />
			</div>
			<p className="text-xs">
				<span className="font-medium">Email:</span>{" "}
				{emailTypeLabel(item.emailType)}
			</p>
			{reason && <p className="text-muted-foreground text-xs">{reason}</p>}
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-xs">
					{new Date(item.createdAt).toLocaleString()}
				</p>
				<EmailStatusActions delivery={item} meta={meta} />
			</div>
		</div>
	);
}

export function EventEmailStatusTable({
	data,
	meta,
	search,
	onSearchChange,
	emailType,
	emailTypes,
	onEmailTypeChange,
	pagination,
}: EventEmailStatusTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const paginationState: PaginationState = {
		pageIndex: pagination.pageIndex,
		pageSize: pagination.pageSize,
	};

	const table = useReactTable({
		data,
		columns: eventEmailStatusColumns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		manualPagination: true,
		manualFiltering: true,
		pageCount: pagination.pageCount,
		onPaginationChange: (updater) => {
			const next =
				typeof updater === "function" ? updater(paginationState) : updater;
			pagination.onPageChange(next.pageIndex);
		},
		state: { sorting, columnVisibility, pagination: paginationState },
		meta,
	});

	const emailTypeFilter: ControlConfig = {
		label: "Email",
		columnId: "emailType",
		type: "filter",
		data: [
			{ label: "All emails", value: "all" },
			...emailTypes.map((value) => ({
				label: emailTypeLabel(value),
				value,
			})),
		],
		customFilter: { value: emailType, onChange: onEmailTypeChange },
	};
	const desktopControlConfigs: ControlConfig[] = [
		emailTypeFilter,
		{
			label: "Columns",
			columnId: "visibility",
			type: "visibility",
			getColumnLabel: (id) => COLUMN_LABELS[id] ?? id,
			excludeColumns: [],
		},
	];
	const mobileControlConfigs: ControlConfig[] = [
		{ ...emailTypeFilter, topPriority: true },
		{ label: "Attendee", columnId: "recipient", type: "sort" },
		{ label: "Status", columnId: "status", type: "sort" },
	];

	const empty = {
		title: "No emails found",
		description: "Emails sent to attendees of this event show up here.",
	};

	return (
		<div className="w-full">
			<BaseTableControl
				table={table}
				searchConfig={{
					searchConfig: {
						placeholder: "Search by email address...",
						enableCustomSearch: true,
						columns: ["recipient"],
						controlled: { value: search, onChange: onSearchChange },
					},
				}}
				desktopConfig={{ controlConfigs: desktopControlConfigs }}
				mobileConfig={{ controlConfigs: mobileControlConfigs }}
			/>

			<div className="min-h-[calc(100vh-380px)]">
				<ResponsiveLayout>
					<DesktopView>
						<div className="overflow-x-auto">
							<BaseTable
								table={table}
								emptyStateConfig={{
									title: empty.title,
									desc: empty.description,
									icon: <MailCheck />,
									action: null,
								}}
							/>
						</div>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{data.length ? (
								data.map((item) => (
									<EmailStatusCard key={item.id} item={item} meta={meta} />
								))
							) : (
								<EmptyState {...empty} icon={<MailCheck />} height="h-auto" />
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{data.length ? (
								data.map((item) => (
									<EmailStatusCard key={item.id} item={item} meta={meta} />
								))
							) : (
								<div className="col-span-2">
									<EmptyState {...empty} icon={<MailCheck />} height="h-auto" />
								</div>
							)}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>
			<DataPagination
				table={table}
				totalRows={pagination.totalCount}
				pageSize={pagination.pageSize}
				onPageSizeChange={pagination.onPageSizeChange}
			/>
		</div>
	);
}
