"use client";

import type { Table } from "@tanstack/react-table";
import { ArrowDown, ChevronDown, QrCode } from "lucide-react";
import { useState } from "react";
import { QuerySearchField } from "@/components/query-search-field";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useIsTablet } from "@/hooks/use-tablet";
import { cn } from "@/lib/utils";

import { ScanModal } from "./scan-modal";
import { useCurrentUserEventVendorId } from "@/hooks/use-event-vendors";

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
	const { isVendor } = useCurrentUserEventVendorId(Number(eventId));

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
						columns={["visitor_name", "visitor_email", "visitor_phone", "vendor_name"]}
						placeholder="Search by name, email, phone..."
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
					{isVendor && (
						<Button
							onClick={() => setScanModalOpen(true)}
							variant="default"
							className="gap-2 rounded-none"
						>
							<QrCode className="h-4 w-4" />
							Scan Visitor
						</Button>
					)}
				</div>
			) : (
				/* Mobile Control Panel */
				<div className="flex flex-col gap-2 lg:hidden">
					<div className="flex gap-2">
						<div className="flex-1">
							<QuerySearchField
								table={table}
								columns={["visitor_name", "visitor_email", "visitor_phone", "vendor_name"]}
								placeholder="Search by name, email, phone..."
							/>
						</div>
						{isVendor && (
							<Button
								onClick={() => setScanModalOpen(true)}
								variant="default"
								className="gap-2 rounded-none"
							>
								<QrCode className="h-4 w-4" />
								<span className="hidden sm:inline">Scan</span>
							</Button>
						)}
					</div>
					<div className="grid grid-cols-3 gap-2">
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("visitor_name")
									?.toggleSorting(
										table.getColumn("visitor_name")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between rounded-none text-left text-xs"
						>
							Name
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("visitor_name")?.getIsSorted() === "asc" &&
										"-rotate-180",
								)}
							/>
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("vendor_name")
									?.toggleSorting(
										table.getColumn("vendor_name")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between rounded-none text-left text-xs"
						>
							Vendor
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("vendor_name")?.getIsSorted() === "asc" &&
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
							Stamped
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
