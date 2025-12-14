"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFormatDate } from "@/hooks/use-format-date";
import type { EventVendor } from "@/lib/api/event-vendor";
import { cn } from "@/lib/utils";
import { EventVendorActionsMenu } from "./action-menu";

export type EventVendorMember = EventVendor;

// Base columns that are always shown
const baseColumns: ColumnDef<EventVendorMember>[] = [
	{
		accessorKey: "vendor.full_name",
		id: "full_name",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Vendor Name</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="font-medium">{row.original.vendor.full_name}</div>
		),
	},
	{
		accessorKey: "vendor.email",
		id: "email",
		size: 220,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Email</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.original.vendor.email}
			</div>
		),
	},
	{
		accessorKey: "type",
		size: 140,
		filterFn: (row, id, value) => {
			return row.getValue(id) === value;
		},
		header: ({ column }) => {
			const filterType = column.getFilterValue() as
				| "Exhibitor"
				| "Merchant"
				| undefined;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<div className="flex items-center gap-2">
							<p className="font-medium">
								Type
								{filterType && (
									<Badge
										variant="secondary"
										className="ml-2 bg-transparent text-xs capitalize underline"
									>
										{filterType}
									</Badge>
								)}
							</p>
							<ChevronDown className="size-4" />
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						side="bottom"
						className="rounded-none bg-background"
					>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue(undefined)}
						>
							All Types
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("Exhibitor")}
						>
							Exhibitor
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("Merchant")}
						>
							Merchant
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		cell: ({ row }) => {
			const type = row.getValue("type") as string;
			return (
				<Badge
					variant="outline"
					className={cn(
						"w-full min-w-20 max-w-24 rounded-none font-bold capitalize",
						type === "Exhibitor" && "border-purple-500 text-purple-500",
						type === "Merchant" && "border-blue-500 text-blue-500",
					)}
				>
					{type}
				</Badge>
			);
		},
	},
	{
		accessorKey: "redirect_url",
		size: 250,
		header: () => <p className="font-medium">Redirect URL</p>,
		cell: ({ row }) => (
			<div className="max-w-[250px] truncate text-muted-foreground text-sm">
				{row.getValue("redirect_url") || "-"}
			</div>
		),
	},
	{
		accessorKey: "poster_url",
		size: 250,
		header: () => <p className="font-medium">Poster URL</p>,
		cell: ({ row }) => (
			<div className="max-w-[250px] truncate text-muted-foreground text-sm">
				{row.getValue("poster_url") || "-"}
			</div>
		),
	},
	{
		accessorKey: "created_at",
		size: 130,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Added At</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			const { formatDate } = useFormatDate();
			const createdAt = row.getValue("created_at") as string;
			const date = new Date(createdAt);
			const formattedDate = formatDate(createdAt);
			const formattedTime = date.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			});

			return (
				<div className="flex flex-col">
					<div className="text-sm">{formattedDate}</div>
					<div className="text-muted-foreground text-xs">{formattedTime}</div>
				</div>
			);
		},
	},
];

// Actions column (only for event_admin and org_owner)
const actionsColumn: ColumnDef<EventVendorMember> = {
	id: "actions",
	size: 80,
	enableHiding: false,
	header: () => <div className="text-center">Actions</div>,
	cell: ({ row }) => {
		const vendor = row.original;
		return (
			<div className="flex justify-center">
				<EventVendorActionsMenu vendor={vendor} />
			</div>
		);
	},
};

// Function to get columns based on permissions
export const getEventVendorColumns = (
	canManageVendors = false,
): ColumnDef<EventVendorMember>[] => {
	// Only users who can manage vendors see actions column
	if (canManageVendors) {
		return [...baseColumns, actionsColumn];
	}
	return baseColumns;
};

// Default export for backward compatibility (with actions column)
export const columns: ColumnDef<EventVendorMember>[] = [
	...baseColumns,
	actionsColumn,
];
