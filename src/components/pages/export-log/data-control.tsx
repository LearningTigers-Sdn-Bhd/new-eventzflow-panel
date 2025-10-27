"use client";

import type { Table } from "@tanstack/react-table";
import { ArrowDown, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";
import { type ExportLogs, getSearchableContent } from "./columns";

interface DataControlProps<TData> {
	table: Table<TData>;
}

export function DataControl<TData>({ table }: DataControlProps<TData>) {
	const _isTablet = useIsTablet();

	// Custom search handler for multi-field search
	const handleSearch = (searchTerm: string) => {
		table.options.globalFilterFn = (row, _columnId, _filterValue) => {
			if (!searchTerm) return true;

			// Use our custom searchable content function
			const searchableContent = getSearchableContent(
				row.original as ExportLogs,
			);
			return searchableContent.toLowerCase().includes(searchTerm.toLowerCase());
		};
		table.setGlobalFilter(searchTerm);
	};

	return (
		<>
			{/* Desktop Control Panel */}
			{!_isTablet ? (
				<div className="hidden items-center gap-2 py-4 lg:flex">
					<div className="relative max-w-sm flex-1">
						<Search className="-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search export logs..."
							className="pl-8"
							onChange={(e) => handleSearch(e.target.value)}
						/>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="ml-auto">
								{/* Number of columns visible */}
								{table.getAllColumns().filter((column) => column.getIsVisible())
									.length - 1}{" "}
								columns
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : (
				/* Mobile Control Panel */
				<div className="flex flex-col gap-2 py-4 lg:hidden">
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search export logs..."
							className="pl-8"
							onChange={(e) => handleSearch(e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("fileName")
									?.toggleSorting(
										table.getColumn("fileName")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
						>
							File Name
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("fileName")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("category")
									?.toggleSorting(
										table.getColumn("category")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
						>
							Category
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("category")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("recordCount")
									?.toggleSorting(
										table.getColumn("recordCount")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
						>
							Records
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("recordCount")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("createdAt")
									?.toggleSorting(
										table.getColumn("createdAt")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
						>
							Created
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("createdAt")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
