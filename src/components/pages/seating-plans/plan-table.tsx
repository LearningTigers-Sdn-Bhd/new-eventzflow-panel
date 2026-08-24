"use client";

import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Grid } from "lucide-react";
import * as React from "react";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
import { BaseTable } from "@/components/admin-ui/table/base-table";
import { EmptyState } from "@/components/data-state";
import type { Plan } from "@/lib/api/plan";
import { generatePlanColumns } from "./plan-columns";
import { PlanItem } from "./plan-item";
import { PlanTableControl, type PlanViewMode } from "./plan-table-control";

interface PlanTableProps {
	eventId: string;
	plans: Plan[];
	onDelete: (planId: number) => void;
	isDeleting: boolean;
}

export function PlanTable({
	eventId,
	plans,
	onDelete,
	isDeleting,
}: PlanTableProps) {
	const [viewMode, setViewMode] = React.useState<PlanViewMode>("card");
	const [globalFilter, setGlobalFilter] = React.useState("");
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});

	const columns = React.useMemo(
		() => generatePlanColumns({ eventId, onDelete, isDeleting }),
		[eventId, onDelete, isDeleting],
	);

	const table = useReactTable({
		data: plans,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onGlobalFilterChange: setGlobalFilter,
		onColumnVisibilityChange: setColumnVisibility,
		state: { globalFilter, columnVisibility },
	});

	const rows = table.getRowModel().rows;

	return (
		<div className="w-full">
			<PlanTableControl
				table={table}
				viewMode={viewMode}
				onViewModeChange={setViewMode}
			/>

			<ResponsiveLayout>
				<MobileTabletView>
					<div className="grid gap-4 md:grid-cols-2">
						{rows.length ? (
							rows.map((row) => (
								<PlanItem
									key={row.id}
									plan={row.original}
									eventId={eventId}
									onDelete={onDelete}
									isDeleting={isDeleting}
								/>
							))
						) : (
							<div className="col-span-full">
								<EmptyState
									title="No seating plans match your search"
									description="Try a different search term."
									icon={<Grid />}
									height="h-auto"
								/>
							</div>
						)}
					</div>
				</MobileTabletView>

				<DesktopView>
					{viewMode === "table" ? (
						<BaseTable
							table={table}
							emptyStateConfig={{
								title: "No seating plans match your search",
								desc: "Try a different search term.",
								icon: <Grid />,
							}}
						/>
					) : (
						<div className="grid gap-4 lg:grid-cols-3">
							{rows.length ? (
								rows.map((row) => (
									<PlanItem
										key={row.id}
										plan={row.original}
										eventId={eventId}
										onDelete={onDelete}
										isDeleting={isDeleting}
									/>
								))
							) : (
								<div className="col-span-full">
									<EmptyState
										title="No seating plans match your search"
										description="Try a different search term."
										icon={<Grid />}
										height="h-auto"
									/>
								</div>
							)}
						</div>
					)}
				</DesktopView>
			</ResponsiveLayout>
		</div>
	);
}
