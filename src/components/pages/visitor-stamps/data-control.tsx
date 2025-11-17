"use client";

import type { Table } from "@tanstack/react-table";
import { ArrowDown, ChevronDown, QrCode, Search } from "lucide-react";
import { useState } from "react";
import { QuerySearchField } from "@/components/query-search-field";
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
import { getSearchableContent } from "./columns";
import { ScanModal } from "./scan-modal";
import type { VisitorStampWithDetails } from "@/lib/api/visitor-stamp";

interface DataControlProps<TData> {
	table: Table<TData>;
	eventId: string;
	onRefetch?: () => void;
}

export function DataControl<TData>({
	table,
	eventId,
	onRefetch,
}: DataControlProps<TData>) {
	const _isTablet = useIsTablet();
	const [scanModalOpen, setScanModalOpen] = useState(false);

	// Custom search handler for multi-field search
	const handleSearch = (searchTerm: string) => {
		table.options.globalFilterFn = (row, _columnId, _filterValue) => {
			if (!searchTerm) return true;

			// Use our custom searchable content function
			const searchableContent = getSearchableContent(
				row.original as VisitorStampWithDetails,
			);
			return searchableContent.toLowerCase().includes(searchTerm.toLowerCase());
		};
		table.setGlobalFilter(searchTerm);
	};

	return (
		<div className="mb-4 flex flex-col border-y border-dashed bg-accent px-0 py-0 md:px-2 md:py-4 lg:px-4 lg:py-4">
			{/* Scan Modal */}
			<ScanModal
				open={scanModalOpen}
				onOpenChange={setScanModalOpen}
				eventId={eventId}
				onRefetch={onRefetch}
			/>

			{/* Desktop Control Panel */}
			{!_isTablet ? (
				<div className="hidden items-center gap-2 lg:flex">
					<QuerySearchField
						table={table}
						columns={["visitor_name", "visitor_public_id", "vendor_name", "created_at"]}
						placeholder="Search visitor stamps..."
					/>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="rounded-none">
								{/* Number of columns visible */}
								{table.getAllColumns().filter((column) => column.getIsVisible())
									.length - 1}{" "}
								columns
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="rounded-none bg-background"
						>
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="rounded-none capitalize"
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
					<Button
						onClick={() => setScanModalOpen(true)}
						variant="default"
						className="gap-2 rounded-none"
					>
						<QrCode className="h-4 w-4" />
						Scan Visitor
					</Button>
				</div>
			) : (
				/* Mobile Control Panel */
				<div className="flex flex-col gap-2 lg:hidden">
					<div className="flex gap-2">
						<div className="relative flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search visitor stamps..."
								className="pl-8"
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</div>
						<Button
							onClick={() => setScanModalOpen(true)}
							variant="default"
							className="gap-2 rounded-none"
						>
							<QrCode className="h-4 w-4" />
							<span className="hidden sm:inline">Scan</span>
						</Button>
					</div>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("full_name")
									?.toggleSorting(
										table.getColumn("full_name")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between rounded-none text-left text-xs"
						>
							Name
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("full_name")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("public_id")
									?.toggleSorting(
										table.getColumn("public_id")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between rounded-none text-left text-xs"
						>
							Public ID
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("public_id")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("phone")
									?.toggleSorting(
										table.getColumn("phone")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between rounded-none text-left text-xs"
						>
							Phone
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("phone")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("created_at")
									?.toggleSorting(
										table.getColumn("created_at")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between rounded-none text-left text-xs"
						>
							Registered
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("created_at")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
