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
import { Layers } from "lucide-react";
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
import type { EventSponsorshipTier } from "@/lib/api/sponsorship/response";
import { EventSponsorshipTierItem } from "./event-sponsorship-tier-item";
import { generateColumns } from "./event-sponsorship-tiers-table-columns";
import { DataControl } from "./event-sponsorship-tiers-table-control";

interface DataTableProps<TData> {
	data: TData[];
	onAddTier?: () => void;
}

export function EventSponsorshipTiersTable<TData>({
	data,
	onAddTier,
}: DataTableProps<TData>) {
	const [sorting, setSorting] = React.useState<SortingState>([
		{ id: "sort_order", desc: false },
	]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const columns = React.useMemo(
		() => generateColumns() as ColumnDef<TData>[],
		[],
	);

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
			<DataControl table={table} />

			<div className="min-h-[65vh]">
				<ResponsiveLayout>
					<DesktopView>
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No tiers found",
								desc: "Add your first tier to get started",
								icon: <Layers />,
								action: onAddTier ? (
									<Button onClick={onAddTier}>Add Tier</Button>
								) : undefined,
							}}
						/>
					</DesktopView>
					<MobileView>
						<div className="space-y-2">
							{table.getRowModel().rows?.length ? (
								table
									.getRowModel()
									.rows.map((row) => (
										<EventSponsorshipTierItem
											key={row.id}
											tier={row.original as EventSponsorshipTier}
										/>
									))
							) : (
								<EmptyState
									title="No tiers found"
									description="Add your first tier to get started"
									icon={<Layers />}
									height="h-auto"
									action={
										onAddTier && <Button onClick={onAddTier}>Add Tier</Button>
									}
								/>
							)}
						</div>
					</MobileView>
					<TabletView>
						<div className="grid grid-cols-2 gap-4">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<div key={row.id} className="col-span-1">
										<EventSponsorshipTierItem
											tier={row.original as EventSponsorshipTier}
										/>
									</div>
								))
							) : (
								<div className="col-span-2">
									<EmptyState
										title="No tiers found"
										description="Add your first tier to get started"
										icon={<Layers />}
										height="h-auto"
										action={
											onAddTier && <Button onClick={onAddTier}>Add Tier</Button>
										}
									/>
								</div>
							)}
						</div>
					</TabletView>
				</ResponsiveLayout>
			</div>

			{/* Pagination */}
			<DataPagination table={table} />
		</div>
	);
}
