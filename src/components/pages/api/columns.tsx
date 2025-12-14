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
import type { ApiKey } from "@/lib/api/api-keys";
import { cn } from "@/lib/utils";
import { ApiKeyActionsMenu } from "./action-menu";

// Format date with time
function formatDateTime(date: string | Date): string {
	if (!date) return "N/A";
	const dateObj = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(dateObj.getTime())) return "Invalid Date";
	return dateObj.toLocaleString();
}

// Format date only
function formatDate(date: string | Date): string {
	if (!date) return "N/A";
	const dateObj = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(dateObj.getTime())) return "Invalid Date";
	return dateObj.toLocaleDateString();
}

export const columns: ColumnDef<ApiKey>[] = [
	{
		accessorKey: "name",
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
		cell: ({ row }) => {
			const name = String(row.getValue("name") || "");
			return <div className="font-medium">{name}</div>;
		},
	},
	{
		accessorKey: "isActive",
		size: 120,
		filterFn: (row, id, value) => {
			return row.getValue(id) === value;
		},
		header: ({ column }) => {
			const filterStatus = column.getFilterValue() as boolean | undefined;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<div className="flex cursor-pointer items-center gap-2">
							<p className="font-medium">
								Status
								{filterStatus !== undefined && (
									<Badge
										variant="secondary"
										className="ml-2 bg-transparent text-xs capitalize underline"
									>
										{filterStatus ? "Active" : "Revoked"}
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
							All Status
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue(true)}
						>
							Active
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue(false)}
						>
							Revoked
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		cell: ({ row }) => {
			const isActive = row.getValue("isActive") as boolean;
			return (
				<Badge
					variant={isActive ? "default" : "secondary"}
					className={cn(
						"min-w-16 rounded-none font-bold capitalize",
						isActive && "bg-green-500 text-white",
						!isActive && "bg-red-500 text-white",
					)}
				>
					{isActive ? "Active" : "Revoked"}
				</Badge>
			);
		},
	},
	{
		accessorKey: "lastUsedAt",
		size: 180,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Last Used</p>
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
			const lastUsedAt = row.getValue("lastUsedAt") as string | null;

			if (!lastUsedAt) {
				return (
					<Badge
						variant="outline"
						className="rounded-none text-muted-foreground"
					>
						Never Used
					</Badge>
				);
			}

			return <div className="text-sm">{formatDate(lastUsedAt)}</div>;
		},
	},
	{
		accessorKey: "createdAt",
		size: 200,
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
			return (
				<div className="text-sm">
					{formatDateTime(row.getValue("createdAt"))}
				</div>
			);
		},
	},
	{
		id: "actions",
		size: 80,
		enableHiding: false,
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => {
			const apiKey = row.original;
			return (
				<div className="flex justify-center">
					<ApiKeyActionsMenu apiKey={apiKey} />
				</div>
			);
		},
	},
];
