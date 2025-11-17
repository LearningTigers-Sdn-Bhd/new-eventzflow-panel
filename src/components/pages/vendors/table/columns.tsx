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
import { cn } from "@/lib/utils";
import type { Vendor } from "@/lib/api/vendor";
import { VendorActionsMenu } from "./action-menu";

export const columns: ColumnDef<Vendor>[] = [
	{
		accessorKey: "full_name",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Name</p>
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
			<div className="font-medium">{row.getValue("full_name")}</div>
		),
	},
	{
		accessorKey: "email",
		size: 250,
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
				{row.getValue("email")}
			</div>
		),
	},
	{
		accessorKey: "phone",
		size: 180,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Phone</p>
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
				{row.getValue("phone") || "-"}
			</div>
		),
	},
	{
		accessorKey: "status",
		size: 120,
		filterFn: (row, id, value) => {
			return row.getValue(id) === value;
		},
		header: ({ column }) => {
			const filterStatus = column.getFilterValue() as
				| "active"
				| "inactive"
				| undefined;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<div className="flex items-center gap-2">
							<p className="font-medium">
								Status
								{filterStatus && (
									<Badge
										variant="secondary"
										className="ml-2 bg-transparent text-xs capitalize underline"
									>
										{filterStatus}
									</Badge>
								)}
							</p>
							<ChevronDown className="size-4" />
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						side="bottom"
						className="rounded-none"
					>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue(undefined)}
						>
							All Status
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("active")}
						>
							Active
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("inactive")}
						>
							Inactive
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		cell: ({ row }) => (
			<Badge
				className={cn(
					"min-w-16 rounded-none font-bold capitalize",
					row.getValue("status") === "active" && "bg-green-500",
					row.getValue("status") === "inactive" && "bg-red-500",
				)}
			>
				{row.getValue("status")}
			</Badge>
		),
	},
	{
		accessorKey: "createdAt",
		size: 130,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Created At</p>
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
			return <div>{formatDate(row.getValue("createdAt"))}</div>;
		},
	},
	{
		id: "actions",
		size: 80,
		enableHiding: false,
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => {
			const vendor = row.original;
			return (
				<div className="flex justify-center">
					<VendorActionsMenu vendor={vendor} />
				</div>
			);
		},
	},
];
