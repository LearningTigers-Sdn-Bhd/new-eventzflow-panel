"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Calendar } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import SeatSessionCreateModal from "./form-modals/seat-session-create-modal";
import { SeatSessionItem } from "./seat-session-items";
import type { SeatSessionRow } from "./seat-session-table-columns";
import { DataControl, type SeatSessionFilter } from "./seat-session-table-control";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	sessionFilter?: SeatSessionFilter;
	onSessionFilterChange?: (filter: SeatSessionFilter) => void;
}

export function SeatSessionTable<TData, TValue>({
	columns,
	data,
	sessionFilter = "active",
	onSessionFilterChange,
}: DataTableProps<TData, TValue>) {
	const { openDialog } = useDialog();
	const { user } = useAuth();
	const isVendor = user?.role === "vendor";

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const openCreate = () => {
		openDialog({
			component: SeatSessionCreateModal,
			config: {
				title: "Create Seat Session",
				description: "Set up a new seat session for this event.",
				size: "lg",
			},
		});
	};

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
	});

	return (
		<div className="w-full">
			<DataControl
				table={table}
				sessionFilter={sessionFilter}
				onSessionFilterChange={onSessionFilterChange}
			/>

			<div className="min-h-[45vh]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No seat sessions found",
								desc: isVendor
									? "No sessions are available for this event yet"
									: "Create your first seat session to get started",
								icon: <Calendar />,
								action: !isVendor ? (
									<Button onClick={openCreate}>Create Session</Button>
								) : undefined,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<SeatSessionItem
										key={row.id}
										session={row.original as SeatSessionRow}
									/>
								))
							) : (
								<EmptyState
									title="No seat sessions found"
									description={
										isVendor
											? "No sessions are available for this event yet"
											: "Create your first seat session to get started"
									}
									icon={<Calendar />}
									height="h-auto"
									action={
										!isVendor ? (
											<Button onClick={openCreate}>Create Session</Button>
										) : undefined
									}
								/>
							)}
						</div>
					</MobileView>
					<TabletView>
						{table.getRowModel().rows?.length ? (
							<div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
								{table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<SeatSessionItem
											session={row.original as SeatSessionRow}
										/>
									</div>
								))}
							</div>
						) : (
							<div className="col-span-2">
								<EmptyState
									title="No seat sessions found"
									description={
										isVendor
											? "No sessions are available for this event yet"
											: "Create your first seat session to get started"
									}
									icon={<Calendar />}
									height="h-auto"
									action={
										!isVendor ? (
											<Button onClick={openCreate}>Create Session</Button>
										) : undefined
									}
								/>
							</div>
						)}
					</TabletView>
				</ResponsiveLayout>
			</div>
			<DataPagination table={table} />
		</div>
	);
}
