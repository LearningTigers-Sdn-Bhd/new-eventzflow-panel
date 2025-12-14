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
import type { TicketType } from "@/lib/api/ticket-type";
import { cn } from "@/lib/utils";
import { TicketTypeActionsMenu } from "./action-menu";

export const columns: ColumnDef<TicketType>[] = [
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
		),
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("name")}</div>
		),
	},
	{
		accessorKey: "price",
		size: 120,
		header: ({ column }) => (
			<div className="flex items-center gap-2">
				<p className="font-medium">Price</p>
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
		),
		cell: ({ row }) => {
			const price = row.getValue("price") as number;
			return <div className="text-muted-foreground">RM{price.toFixed(2)}</div>;
		},
	},
	{
		accessorKey: "quantity",
		size: 100,
		header: ({ column }) => (
			<div className="flex items-center gap-2">
				<p className="font-medium">Quantity</p>
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
		),
		cell: ({ row }) => <div>{row.getValue("quantity")}</div>,
	},
	{
		accessorKey: "maxPerOrder",
		size: 120,
		header: () => <p className="font-medium">Max/Order</p>,
		cell: ({ row }) => <div>{row.getValue("maxPerOrder")}</div>,
	},
	{
		accessorKey: "status",
		size: 120,
		filterFn: (row, id, value) => row.getValue(id) === value,
		header: ({ column }) => {
			const filterStatus = column.getFilterValue() as string | undefined;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 rounded-none p-0">
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
						</Button>
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
							onClick={() => column.setFilterValue("draft")}
						>
							Draft
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("published")}
						>
							Published
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("archived")}
						>
							Archived
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge
					className={cn(
						"min-w-16 rounded-none font-bold capitalize",
						status === "published" && "bg-green-500",
						status === "draft" && "bg-yellow-500",
						status === "archived" && "bg-gray-500",
					)}
				>
					{status}
				</Badge>
			);
		},
	},
	{
		id: "actions",
		size: 80,
		enableHiding: false,
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => (
			<div className="flex justify-center">
				<TicketTypeActionsMenu ticketType={row.original} />
			</div>
		),
	},
];
