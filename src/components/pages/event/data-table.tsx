"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
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
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";
import type { Event } from "./columns";
import CreateEventForm from "./create-event-form";
import { DataControl } from "./data-control";
import { EventItem } from "./event-item";

type EventFilter = "active" | "archived" | "all";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onCreateEvent?: () => void;
	eventFilter?: EventFilter;
	onEventFilterChange?: (filter: EventFilter) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	onCreateEvent,
	eventFilter = "active",
	onEventFilterChange,
}: DataTableProps<TData, TValue>) {
	const _isMobile = useIsMobile();
	const isTablet = useIsTablet();
	const { user } = useAuth();
	const { openDialog, closeDialog } = useDialog();

	const [sorting, setSorting] = React.useState<SortingState>([
		{
			id: "created_at",
			desc: true, // Sort by newest first (descending)
		},
	]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const handleCreateEvent = () => {
		if (onCreateEvent) {
			onCreateEvent();
		} else {
			openDialog({
				component: CreateEventForm,
				props: {
					onClose: closeDialog,
				},
				config: {
					title: "Create New Event",
					description: "Fill in the details to create a new event",
					size: "2xl",
				},
			});
		}
	};

	// Get empty state props based on user role
	const getEmptyStateProps = () => {
		if (user?.role === "org_owner") {
			return {
				title: "No events found",
				description: "Create your first event to get started",
				action: <Button onClick={handleCreateEvent}>Create Event</Button>,
			};
		}
		// Member role
		return {
			title: "No events found",
			description: "There are currently no events available.",
			action: undefined,
		};
	};

	const emptyStateProps = getEmptyStateProps();

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
			{/* Control Panel */}
			<DataControl
				table={table}
				eventFilter={eventFilter}
				onEventFilterChange={onEventFilterChange}
			/>

			<div className="min-h-[65vh]">
				{/* Data Table */}
				{!_isMobile && !isTablet ? (
					<div className="overflow-x-auto rounded-none border">
						<Table className="w-full">
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											const columnId = header.column.id;
											let widthClass = "";

											// Set width classes based on column ID
											if (columnId === "id") widthClass = "w-[140px]";
											else if (columnId === "title")
												widthClass = "w-auto min-w-[300px]";
											else if (columnId === "status") widthClass = "w-[160px]";
											else if (columnId === "created_at")
												widthClass = "w-[140px]";
											else if (columnId === "actions") widthClass = "w-[160px]";

											return (
												<TableHead
													key={header.id}
													className={cn(
														widthClass,
														header.index === 0 && "ps-3",
													)}
												>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext(),
															)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
										>
											{row.getVisibleCells().map((cell) => {
												const columnId = cell.column.id;
												let widthClass = "";

												// Set width classes based on column ID
												if (columnId === "id") widthClass = "w-[140px]";
												else if (columnId === "title")
													widthClass = "w-auto min-w-[300px]";
												else if (columnId === "status")
													widthClass = "w-[160px]";
												else if (columnId === "visibility")
													widthClass = "w-[120px]";
												else if (columnId === "created_at")
													widthClass = "w-[140px]";
												else if (columnId === "actions")
													widthClass = "w-[160px]";

												return (
													<TableCell
														key={cell.id}
														className={cn(
															widthClass,
															table.getVisibleLeafColumns()[0]?.id ===
																cell.column.id && "ps-4",
														)}
													>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext(),
														)}
													</TableCell>
												);
											})}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center"
										>
											<EmptyState
												title={emptyStateProps.title}
												description={emptyStateProps.description}
												icon={<Calendar />}
												height="h-auto"
												action={emptyStateProps.action}
											/>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				) : isTablet && !_isMobile ? (
					<div className="grid grid-cols-2 gap-4">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<div key={row.id} className="col-span-1">
									<EventItem event={row.original as Event} />
								</div>
							))
						) : (
							<EmptyState
								title={emptyStateProps.title}
								description={emptyStateProps.description}
								icon={<Calendar />}
								height="h-auto"
								action={emptyStateProps.action}
							/>
						)}
					</div>
				) : (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<EventItem key={row.id} event={row.original as Event} />
								))
						) : (
							<EmptyState
								title={emptyStateProps.title}
								description={emptyStateProps.description}
								icon={<Calendar />}
								height="h-auto"
								action={emptyStateProps.action}
							/>
						)}
					</div>
				)}
			</div>
			<DataPagination table={table} />
		</div>
	);
}
