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
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { useResponsiveDeterminer } from "@/hooks/use-responsive-determiner";
import CreateEventForm from "./create-event-form";
import { EventItem } from "./event-item";
import type { Event } from "./event-table-columns";
import { DataControl } from "./event-table-control";

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
	const { isMobile, isDesktop } = useResponsiveDeterminer();
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
		if (user?.role === "org_owner" || user?.role === "organizer") {
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
				{isDesktop ? (
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: emptyStateProps.title,
							desc: emptyStateProps.description,
							icon: <Calendar />,
							action: emptyStateProps.action,
						}}
					/>
				) : isMobile ? (
					<div className="space-y-2 pb-6">
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
				) : (
					<div className="grid grid-cols-2 gap-4 pb-6">
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
				)}
			</div>
			<DataPagination table={table} />
		</div>
	);
}
