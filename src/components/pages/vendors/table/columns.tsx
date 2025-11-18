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
			<div className="font-medium">{row.getValue("full_name")}</div>
		),
	},
	{
		id: "person_in_charge",
		size: 180,
		accessorFn: (row) => row.vendorProfile?.person_in_charge,
		header: () => <p className="font-medium">Person In Charge</p>,
		cell: ({ row }) => {
			const personInCharge = row.original.vendorProfile?.person_in_charge;
			return (
				<div className="text-sm">
					{personInCharge || "-"}
				</div>
			);
		},
	},
	{
		id: "contact",
		size: 250,
		header: () => <p className="font-medium">Contact</p>,
		cell: ({ row }) => {
			const vendor = row.original;
			return (
				<div className="text-sm space-y-0.5">
					<div className="text-muted-foreground">{vendor.email}</div>
					{vendor.phone && (
						<div className="text-muted-foreground text-xs">{vendor.phone}</div>
					)}
				</div>
			);
		},
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
