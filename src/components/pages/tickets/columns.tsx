"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TicketActionsMenu } from "./action-menu";

export type BaseTicket = {
	id: string;
	publicId: string;
	name: string;
	email: string | null;
	phone: string;
	value: number | string;
	status: "scanned" | "not_scanned";
	customLabels?: Array<{ name: string; value: string }>;
	createdAt: string;
	ticketTypeId?: number;
	ticketTypeName?: string;
	checkedIn?: boolean;
	checkInAt?: string | null;
};

export function generateColumns(labelsData?: Record<string, string>): ColumnDef<BaseTicket>[] {
	const baseColumns: ColumnDef<BaseTicket>[] = [
		{
			accessorKey: "name",
			size: 200,
			header: ({ column }) => (
				<div className="flex items-center gap-2">
					<p className="font-medium">Name</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			),
			cell: ({ row }) => (
				<div className="flex flex-col gap-1">
					<div className="truncate font-medium">{row.getValue("name")}</div>
					<div className="truncate text-muted-foreground text-xs">
						{row.original.phone || "No phone"}
					</div>
				</div>
			),
		},
		{
			accessorKey: "phone",
			enableHiding: false,
			enableSorting: false,
			// Hidden column used for search functionality
		},
		{
			accessorKey: "ticketTypeName",
			size: 140,
			header: "Ticket Type",
			cell: ({ row }) => (
				<div className="truncate font-medium">
					{row.getValue("ticketTypeName") || "N/A"}
				</div>
			),
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
		},
		{
			accessorKey: "status",
			size: 120,
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				return (
					<Badge
						variant={status === "scanned" ? "default" : "secondary"}
						className={cn(
							status === "scanned"
								? "bg-green-100 text-green-800 hover:bg-green-100"
								: "bg-gray-100 text-gray-800 hover:bg-gray-100",
						)}
					>
						{status === "scanned" ? "Scanned" : "Not Scanned"}
					</Badge>
				);
			},
			filterFn: (row, id, value) => value.includes(row.getValue(id)),
		},
		{
			accessorKey: "createdAt",
			size: 140,
			header: ({ column }) => (
				<div className="flex items-center gap-2">
					<p className="font-medium">Created At</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			),
			cell: ({ row }) => {
				const date = new Date(row.getValue("createdAt"));
				return <div className="font-medium">{date.toLocaleDateString()}</div>;
			},
		},
		{
			id: "actions",
			size: 120,
			enableHiding: false,
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => (
				<div className="flex justify-center">
					<TicketActionsMenu ticket={row.original} />
				</div>
			),
		},
	];

	// Generate dynamic columns for custom fields
	const customColumns: ColumnDef<BaseTicket>[] = [];
	if (labelsData && Object.keys(labelsData).length > 0) {
		Object.entries(labelsData).forEach(([key, labelName]) => {
			customColumns.push({
				id: `custom_${key}`,
				accessorFn: (row) => {
					const customLabel = row.customLabels?.find((l) => l.name === labelName);
					return customLabel?.value || "";
				},
				size: 180,
				header: ({ column }) => (
					<div className="flex items-center gap-2">
						<p className="font-medium">{labelName}</p>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						>
							<ArrowDown
								className={cn(
									"size-4 transition-transform",
									column.getIsSorted() === "asc" && "-rotate-180",
								)}
							/>
						</Button>
					</div>
				),
				cell: ({ row }) => {
					const customLabel = row.original.customLabels?.find((l) => l.name === labelName);
					const value = customLabel?.value || "";
					return (
						<div
							className={cn(
								"truncate font-medium",
								!value && "text-muted-foreground italic",
							)}
						>
							{value || "Not provided"}
						</div>
					);
				},
				enableSorting: true,
				enableHiding: true,
			});
		});
	}

	// Insert custom columns before the actions column
	return [...baseColumns.slice(0, -1), ...customColumns, baseColumns[baseColumns.length - 1]];
}
