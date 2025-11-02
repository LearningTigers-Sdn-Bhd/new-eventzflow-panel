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
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
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
import { useDialog } from "@/hooks/use-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";
import { getEventById } from "@/lib/api/event";
import type { PendingTicket } from "./columns";
import { DataControl } from "./data-control";
import PendingTicketForm from "./page-action/ticket-form";
import { PendingTicketItem } from "./ticket-item";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const _isMobile = useIsMobile();
	const isTablet = useIsTablet();
	const { openDialog } = useDialog();
	const params = useParams();
	const eventId = params.event_id as string;

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({
			phone: false, // Hide phone column as it's only used for search
		});
	
	const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});

	const { data: eventData } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});

	const hasCustomLabels = React.useMemo(
		() => eventData?.labels_data && Object.keys(eventData.labels_data).length > 0,
		[eventData?.labels_data],
	);

	const openPendingTicketCreate = () => {
		openDialog({
			component: PendingTicketForm,
			config: {
				title: "Create Pending Ticket",
				description: "Create a new pending ticket for your event.",
				size: "full",
				showCloseButton: false,
			},
		});
	};

	const toggleRowExpansion = (rowId: string) => {
		setExpandedRows(prev => ({
			...prev,
			[rowId]: !prev[rowId]
		}));
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
			<DataControl table={table} labelsData={eventData?.labels_data} />

			{!_isMobile && !isTablet ? (
				<div className="overflow-hidden rounded-md border">
					<Table className="w-full table-fixed">
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => {
								return (
								<TableRow key={headerGroup.id}>
										{hasCustomLabels && (
											<TableHead className="w-12 ps-3"></TableHead>
										)}
									{headerGroup.headers.map((header) => {
										return (
											<TableHead
												key={header.id}
												style={{ width: `${header.getSize()}px` }}
													className={cn(!hasCustomLabels && header.index === 0 && "ps-3")}
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
								);
							})}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => {
									const isExpanded = expandedRows[row.id];
									const ticket = row.original as PendingTicket;

									return (
										<React.Fragment key={row.id}>
											<TableRow data-state={row.getIsSelected() && "selected"}>
												{hasCustomLabels && (
													<TableCell className="w-12 ps-4">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toggleRowExpansion(row.id)}
															className="h-8 w-8 p-0"
														>
															{isExpanded ? (
																<ChevronDown className="h-4 w-4" />
															) : (
																<ChevronRight className="h-4 w-4" />
															)}
														</Button>
													</TableCell>
												)}
												{row.getVisibleCells().map((cell, index) => (
											<TableCell
												key={cell.id}
												style={{ width: `${cell.column.getSize()}px` }}
												className={cn(
															!hasCustomLabels &&
													table.getVisibleLeafColumns()[0]?.id ===
																	cell.column.id &&
																"ps-4",
												)}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
											{isExpanded && hasCustomLabels && (
												<TableRow>
													<TableCell
														colSpan={
															row.getVisibleCells().length + (hasCustomLabels ? 1 : 0)
														}
														className="border-t bg-gradient-to-br from-muted/30 to-muted/50 p-0"
													>
														<div className="px-6 py-4">
															<div className="mb-3 border-b pb-2">
																<h4 className="font-semibold text-sm text-foreground">
																	Additional Information
																</h4>
															</div>
															<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
																{eventData?.labels_data &&
																	Object.entries(eventData.labels_data).map(
																		([key, labelName]) => {
																			const value =
																				ticket.customLabels?.find(
																					(l) => l.name === labelName,
																				)?.value || "";
																			return (
																				<div
																					key={key}
																					className="space-y-1.5 rounded-md border bg-card/50 px-3 py-2.5 transition-colors hover:bg-card"
																				>
																					<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
																						{labelName}
																					</p>
																					<p
																						className={cn(
																							"font-medium text-sm",
																							!value &&
																								"text-muted-foreground italic",
																						)}
																					>
																						{value || "Not provided"}
																					</p>
																				</div>
																			);
																		},
																	)}
															</div>
														</div>
													</TableCell>
												</TableRow>
											)}
										</React.Fragment>
									);
								})
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										<EmptyState
											title="No pending tickets found"
											description="Create your first pending ticket to get started"
											icon={<Calendar />}
											height="h-auto"
											action={
												<Button onClick={openPendingTicketCreate}>
													Create Pending Ticket
												</Button>
											}
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
								<PendingTicketItem 
									ticket={row.original as PendingTicket}
									labelsData={eventData?.labels_data}
								/>
							</div>
						))
					) : (
						<EmptyState
							title="No pending tickets found"
							description="Create your first pending ticket to get started"
							icon={<Calendar />}
							height="h-auto"
							action={
								<Button onClick={openPendingTicketCreate}>
									Create Pending Ticket
								</Button>
							}
						/>
					)}
				</div>
			) : (
				<div className="space-y-2">
					{table.getRowModel().rows?.length ? (
						table
							.getRowModel()
							.rows.map((row) => (
								<PendingTicketItem
									key={row.id}
									ticket={row.original as PendingTicket}
									labelsData={eventData?.labels_data}
								/>
							))
					) : (
						<EmptyState
							title="No pending tickets found"
							description="Create your first pending ticket to get started"
							icon={<Calendar />}
							height="h-auto"
							action={
								<Button onClick={openPendingTicketCreate}>
									Create Pending Ticket
								</Button>
							}
						/>
					)}
				</div>
			)}

			<DataPagination table={table} />
		</div>
	);
}
