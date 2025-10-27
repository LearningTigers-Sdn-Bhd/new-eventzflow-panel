"use client";

import { useState } from "react";
import type { Table } from "@tanstack/react-table";
import { ArrowDown, ChevronDown, Search, ScanLine } from "lucide-react";
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
import { getSearchableContent, type ScannedLog } from "./columns";
import { ScanModal } from "./scan-modal";

interface DataControlProps<TData> {
	table: Table<TData>;
	eventId: string;
	onRefetch?: () => void;
	canScanTickets?: boolean;
}

export function DataControl<TData>({ 
	table, 
	eventId, 
	onRefetch,
	canScanTickets = false,
}: DataControlProps<TData>) {
	const _isTablet = useIsTablet();
	const [scanModalOpen, setScanModalOpen] = useState(false);

	// Custom search handler for multi-field search
	const handleSearch = (searchTerm: string) => {
		table.options.globalFilterFn = (row, _columnId, _filterValue) => {
			if (!searchTerm) return true;

			// Use our custom searchable content function
			const searchableContent = getSearchableContent(
				row.original as ScannedLog,
			);
			return searchableContent.toLowerCase().includes(searchTerm.toLowerCase());
		};
		table.setGlobalFilter(searchTerm);
	};

	return (
		<>
			{/* Scan Modal */}
			<ScanModal
				open={scanModalOpen}
				onOpenChange={setScanModalOpen}
				eventId={eventId}
				onRefetch={onRefetch}
			/>

			{/* Desktop Control Panel */}
			{!_isTablet ? (
				<div className="hidden items-center gap-2 py-4 lg:flex">
					<div className="relative flex-1">
						<Search className="-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search scanned logs..."
							className="pl-8"
							onChange={(e) => handleSearch(e.target.value)}
						/>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
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
					{canScanTickets && (
						<Button
							onClick={() => setScanModalOpen(true)}
							variant="default"
							className="gap-2"
						>
							<ScanLine className="h-4 w-4" />
							Scan
						</Button>
					)}
				</div>
			) : (
				/* Mobile Control Panel */
				<div className="flex flex-col gap-2 py-4 lg:hidden">
					<div className="flex gap-2">
						<div className="relative flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search scanned logs..."
								className="pl-8"
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</div>
						{canScanTickets && (
							<Button
								onClick={() => setScanModalOpen(true)}
								variant="default"
								className="gap-2"
							>
								<ScanLine className="h-4 w-4" />
								<span className="hidden sm:inline">Scan</span>
							</Button>
						)}
					</div>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("name")
									?.toggleSorting(
										table.getColumn("name")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
						>
							Name
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("name")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("locationName")
									?.toggleSorting(
										table.getColumn("locationName")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
						>
							Location
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("locationName")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("status")
									?.toggleSorting(
										table.getColumn("status")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
						>
							Status
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("status")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("checkedInAt")
									?.toggleSorting(
										table.getColumn("checkedInAt")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between text-xs"
						>
							Checked In
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("checkedInAt")?.getIsSorted() === "asc" &&
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
