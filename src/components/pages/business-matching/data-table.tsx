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
import { Briefcase } from "lucide-react";
import * as React from "react";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { QuerySearchField } from "@/components/query-search-field";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useDialog } from "@/hooks/use-dialog";
import { useIsTablet } from "@/hooks/use-tablet";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import { BusinessMatchingItem } from "./business-matching-item";
import SessionActivityDialog from "./session-activity-dialog";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const isTablet = useIsTablet();
	const { openDialog } = useDialog();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [selectedTag, setSelectedTag] = React.useState<string | null>(null);

	// Get all unique tags from data
	const allUniqueTags = React.useMemo(() => {
		const tagsSet = new Set<string>();
		for (const row of data) {
			const eventTags = (row as any).offering_tags || [];
			for (const tag of eventTags) {
				tagsSet.add(tag);
			}
		}
		return Array.from(tagsSet);
	}, [data]);

	// Filter data based on selected tag
	const filteredData = React.useMemo(() => {
		if (!selectedTag) return data;
		return data.filter((row: any) => {
			const eventTags = row.offering_tags || [];
			return eventTags.includes(selectedTag);
		});
	}, [data, selectedTag]);

	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const openBookings = React.useCallback(
		(row: TData) => {
			const bmEvent = row as unknown as BusinessMatchingEvent;
			openDialog({
				component: SessionActivityDialog,
				props: {
					bmEventId: bmEvent.id,
					eventId: bmEvent.event_id,
				},
				config: {
					title: `Bookings & Availability for ${bmEvent.title}`,
					size: "5xl",
				},
			});
		},
		[openDialog],
	);

	const table = useReactTable({
		data: filteredData,
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
			<div className="mb-4 flex flex-col rounded-lg border border-dashed bg-transparent p-4 lg:bg-accent">
				<div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
					<div className="flex-1">
						<QuerySearchField
							table={table}
							columns={["title", "location"]}
							placeholder="Search sessions or location..."
							searchCustomFields={false}
						/>
					</div>
					{allUniqueTags.length > 0 && (
						<div className="w-full sm:w-[220px]">
							<select
								value={selectedTag || ""}
								onChange={(e) => setSelectedTag(e.target.value || null)}
								className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							>
								<option value="">All Categories / Tags</option>
								{allUniqueTags.map((tag) => (
									<option key={tag} value={tag}>
										{tag}
									</option>
								))}
							</select>
						</div>
					)}
				</div>
			</div>

			{/* Data Table */}
			{!isTablet ? (
				<div className="rounded-none border border-dashed">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id}>
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
										onClick={() => openBookings(row.original)}
										className="cursor-pointer hover:bg-muted/50"
									>
										{row.getVisibleCells().map((cell) => {
											// Host and Actions cells own their own click targets
											// (host details link, edit button) — don't let the
											// row-level "open bookings" click fire underneath them.
											const stopsPropagation =
												cell.column.id === "host" ||
												cell.column.id === "actions";
											return (
												<TableCell
													key={cell.id}
													onClick={
														stopsPropagation
															? (e) => e.stopPropagation()
															: undefined
													}
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
											title="No events found"
											description="Business matching events will appear here."
											icon={<Briefcase />}
											height="h-auto"
										/>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			) : (
				<div className="mt-4 space-y-2">
					{table.getRowModel().rows?.length ? (
						table
							.getRowModel()
							.rows.map((row) => (
								<BusinessMatchingItem
									key={row.id}
									event={row.original as BusinessMatchingEvent}
								/>
							))
					) : (
						<EmptyState
							title="No events found"
							description="Business matching events will appear here."
							icon={<Briefcase />}
							height="h-auto"
						/>
					)}
				</div>
			)}
			<DataPagination table={table} />
		</div>
	);
}
