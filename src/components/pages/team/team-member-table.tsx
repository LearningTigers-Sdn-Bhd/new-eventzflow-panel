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
import { Users } from "lucide-react";
import * as React from "react";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { useResponsiveDeterminer } from "@/hooks/use-responsive-determiner";
import { TeamMemberItem } from "./team-member-item";
import type { TeamMember } from "./team-member-table-columns";
import { DataControl } from "./team-member-table-control";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onAddMember?: () => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	onAddMember,
}: DataTableProps<TData, TValue>) {
	const { isMobile, isDesktop } = useResponsiveDeterminer();
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
	});

	return (
		<div className="w-full">
			{/* Control Panel */}
			<DataControl table={table} />

			{/* Data Table */}
			<div className="flex min-h-[calc(100vh-320px)] flex-col">
				{isDesktop ? (
					<BaseTable
						table={table}
						emptyStateConfig={{
							title: "No team members found",
							desc: "Add your first team member to get started",
							icon: <Users />,
							action: <Button onClick={onAddMember}>Add Team Member</Button>,
						}}
					/>
				) : isMobile ? (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<TeamMemberItem
										key={row.id}
										member={row.original as TeamMember}
									/>
								))
						) : (
							<EmptyState
								title="No team members found"
								description="Add your first team member to get started"
								icon={<Users />}
								height="h-auto"
								action={<Button onClick={onAddMember}>Add Team Member</Button>}
							/>
						)}
					</div>
				) : (
					<div className="space-y-2">
						{table.getRowModel().rows?.length ? (
							table
								.getRowModel()
								.rows.map((row) => (
									<TeamMemberItem
										key={row.id}
										member={row.original as TeamMember}
									/>
								))
						) : (
							<EmptyState
								title="No team members found"
								description="Add your first team member to get started"
								icon={<Users />}
								height="h-auto"
								action={<Button onClick={onAddMember}>Add Team Member</Button>}
							/>
						)}
					</div>
				)}
			</div>

			{/* Pagination */}
			<DataPagination table={table} />
		</div>
	);
}
