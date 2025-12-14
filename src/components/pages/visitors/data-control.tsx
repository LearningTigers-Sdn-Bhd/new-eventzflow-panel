"use client";

import type { Table } from "@tanstack/react-table";
import { ArrowDown, ChevronDown } from "lucide-react";
import * as React from "react";
import { QuerySearchField } from "@/components/query-search-field";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsTablet } from "@/hooks/use-tablet";
import type { Visitor } from "@/lib/api/visitor";
import { cn } from "@/lib/utils";

interface DataControlProps {
	table: Table<Visitor>;
	eventId: number;
}

function getColumnLabel(columnId: string): string {
	const standardLabels: Record<string, string> = {
		full_name: "Name",
		email: "Email",
		public_id: "Public ID",
		created_at: "Created At",
	};

	return standardLabels[columnId] || columnId;
}

export function DataControl({ table, eventId }: DataControlProps) {
	const _isTablet = useIsTablet();

	return (
		<div className="mb-4 flex flex-col border-y border-dashed bg-accent px-0 py-0 md:px-2 md:py-4 lg:px-4 lg:py-4">
			{/* Desktop Control Panel */}
			{!_isTablet ? (
				<div className="hidden items-center gap-2 lg:flex">
					<QuerySearchField
						table={table}
						columns={["full_name", "email", "phone", "public_id"]}
						searchCustomFields={false}
						placeholder="Search visitors..."
					/>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="ml-auto rounded-none">
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
								.filter(
									(column) => column.getCanHide() && column.id !== "phone",
								)
								.map((column) => {
									const label = getColumnLabel(column.id);

									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="rounded-none capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}
										>
											{label}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : (
				/* Mobile Control Panel */
				<div className="flex flex-col gap-2 lg:hidden">
					<QuerySearchField
						table={table}
						columns={["full_name", "email", "phone", "public_id"]}
						searchCustomFields={false}
						placeholder="Search visitors..."
					/>
					<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
						<Button
							variant="outline"
							onClick={() =>
								table
									.getColumn("full_name")
									?.toggleSorting(
										table.getColumn("full_name")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between rounded-none text-xs"
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
									.getColumn("email")
									?.toggleSorting(
										table.getColumn("email")?.getIsSorted() === "asc",
									)
							}
							className="flex items-center justify-between rounded-none text-xs"
						>
							Email
							<ArrowDown
								className={cn(
									"size-3.5 transition-transform",
									table.getColumn("email")?.getIsSorted() === "asc" &&
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
							className="flex items-center justify-between rounded-none text-xs"
						>
							Created
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
