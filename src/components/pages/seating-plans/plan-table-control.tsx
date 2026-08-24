"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDown, LayoutGrid, Table2 } from "lucide-react";
import { QuerySearchField } from "@/components/query-search-field";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Plan } from "@/lib/api/plan";
import { cn } from "@/lib/utils";

export type PlanViewMode = "card" | "table";

interface PlanTableControlProps {
	table: Table<Plan>;
	viewMode: PlanViewMode;
	onViewModeChange: (mode: PlanViewMode) => void;
}

export function PlanTableControl({
	table,
	viewMode,
	onViewModeChange,
}: PlanTableControlProps) {
	const columns = table.getAllColumns().filter((column) => column.getCanHide());
	const visibleColumnCount = columns.filter((column) =>
		column.getIsVisible(),
	).length;

	return (
		<div className="mb-4 flex flex-col gap-3 border border-dashed bg-transparent px-0 py-0 md:flex-row md:items-center md:px-2 md:py-4 lg:bg-accent lg:px-4 lg:py-4">
			<QuerySearchField
				table={table}
				columns={["name"]}
				placeholder="Search seating plans..."
				searchCustomFields={false}
			/>

			<div className="hidden items-center gap-2 lg:ml-auto lg:flex">
				<div className="flex border">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className={cn(
							"rounded-none",
							viewMode === "card" && "bg-accent-foreground/10",
						)}
						onClick={() => onViewModeChange("card")}
					>
						<LayoutGrid className="mr-2 h-4 w-4" />
						Card
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className={cn(
							"rounded-none border-l",
							viewMode === "table" && "bg-accent-foreground/10",
						)}
						onClick={() => onViewModeChange("table")}
					>
						<Table2 className="mr-2 h-4 w-4" />
						Table
					</Button>
				</div>

				{viewMode === "table" && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="rounded-none">
								{visibleColumnCount} columns
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="rounded-none bg-background"
						>
							{columns.map((column) => (
								<DropdownMenuCheckboxItem
									key={column.id}
									className="rounded-none capitalize"
									checked={column.getIsVisible()}
									onSelect={(event) => event.preventDefault()}
									onCheckedChange={(value) => column.toggleVisibility(!!value)}
								>
									{column.id.replace(/_/g, " ")}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</div>
	);
}
