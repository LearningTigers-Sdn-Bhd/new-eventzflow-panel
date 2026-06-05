"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	type TableMeta,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Mail } from "lucide-react";
import * as React from "react";
import {
	DesktopView,
	MobileView,
	ResponsiveLayout,
	TabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import type { EmailDelivery } from "@/lib/api/email-delivery";
import { EmailLogTableControl } from "./email-log-table-control";

interface EmailLogTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	meta?: TableMeta<TData>;
}

function EmailLogCard({ item }: { item: EmailDelivery }) {
	return (
		<div className="space-y-1 rounded-none border border-dashed p-3">
			<p className="font-medium text-sm">{item.recipient || "-"}</p>
			<p className="text-muted-foreground text-xs">{item.subject || "-"}</p>
			<p className="text-xs">
				<span className="font-medium">Status:</span> {item.status}
			</p>
			<p className="text-xs">
				<span className="font-medium">Mailer:</span> {item.mailerName}.
				{item.mailerAction}
			</p>
			<p className="text-muted-foreground text-xs">
				{new Date(item.createdAt).toLocaleString()}
			</p>
		</div>
	);
}

export function EmailLogTable<TData, TValue>({
	columns,
	data,
	meta,
}: EmailLogTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
		meta,
	});

	return (
		<div className="w-full">
			<EmailLogTableControl table={table} />

			<div className="min-h-[calc(100vh-320px)]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No email logs found",
								desc: "Try adjusting your filters.",
								icon: <Mail />,
								action: null,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<EmailLogCard
											key={row.id}
											item={row.original as EmailDelivery}
										/>
									))
							) : (
								<EmptyState
									title="No email logs found"
									description="Try adjusting your filters."
									icon={<Mail />}
									height="h-auto"
								/>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<EmailLogCard item={row.original as EmailDelivery} />
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No email logs found"
										description="Try adjusting your filters."
										icon={<Mail />}
										height="h-auto"
									/>
								</div>
							)}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>
			<DataPagination table={table} />
		</div>
	);
}
