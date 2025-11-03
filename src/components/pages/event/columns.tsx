"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ChevronDown, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useFormatDate } from "@/hooks/use-format-date";
import { cn } from "@/lib/utils";
import { EventActionsMenu } from "./action-menu";

export type Event = {
	id: number;
	title: string;
	description: string | null;
	status: "draft" | "published" | "cancelled";
	visibility: boolean;
	multiple_scans: boolean;
	start_date: string;
	end_date: string;
	webhook_url: string | null;
	labels_data: Record<string, any>;
	payment_status: "unpaid" | "paid" | "waived";
	price: string;
	published: boolean;
	created_at: string;
	updated_at: string;
};

// Base columns that everyone sees
const baseColumns: ColumnDef<Event>[] = [
	{
		accessorKey: "id",
		size: 140,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Event ID</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none hover:border"
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
			const { copyToClipboard } = useCopyToClipboard({
				successMessage: "Event ID copied to clipboard",
			});

			return (
				<div className="flex items-center gap-2 text-center font-medium">
					<p className="truncate">{row.getValue("id")}</p>
					<Button
						variant="ghost"
						size="icon"
						className="rounded-none hover:border"
						onClick={() => copyToClipboard(row.getValue("id"))}
					>
						<Copy className="size-4" />
					</Button>
				</div>
			);
		},
	},
	{
		accessorKey: "title",
		size: 400,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Title</p>
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
			);
		},
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("title")}</div>
		),
	},
	{
		accessorKey: "status",
		size: 160,
		filterFn: (row, id, value) => {
			return row.getValue(id) === value;
		},
		header: ({ column }) => {
			const filterStatus = column.getFilterValue() as
				| "draft"
				| "published"
				| "cancelled"
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
					<DropdownMenuContent align="start" side="bottom">
						<DropdownMenuItem onClick={() => column.setFilterValue(undefined)}>
							All Status
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => column.setFilterValue("draft")}>
							Draft
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => column.setFilterValue("published")}
						>
							Published
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => column.setFilterValue("cancelled")}
						>
							Cancelled
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		cell: ({ row }) => (
			<Badge
				className={cn(
					"w-full min-w-16 max-w-24 rounded-none font-bold capitalize",
					row.getValue("status") === "published" && "bg-green-500",
					row.getValue("status") === "draft" && "bg-yellow-500",
					row.getValue("status") === "cancelled" && "bg-red-500",
				)}
			>
				{row.getValue("status")}
			</Badge>
		),
	},
	{
		accessorKey: "created_at",
		size: 140,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Created At</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none hover:border"
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
			return <div>{formatDate(row.getValue("created_at"))}</div>;
		},
	},
	{
		id: "actions",
		size: 160,
		enableHiding: false,
		header: "Actions",
		cell: ({ row }) => {
			const _event = row.original;
			return <EventActionsMenu eventId={_event.id} />;
		},
	},
];

// Visibility column - only for org_owner
const visibilityColumn: ColumnDef<Event> = {
	accessorKey: "visibility",
	size: 120,
	header: ({ column }) => {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className="-ml-3 h-8">
						<span className="font-medium">Visibility</span>
						<ChevronDown className="ml-2 size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<DropdownMenuItem
						onClick={() => column.setFilterValue(undefined)}
						className={!column.getFilterValue() ? "bg-accent" : ""}
					>
						All
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => column.setFilterValue(true)}
						className={column.getFilterValue() === true ? "bg-accent" : ""}
					>
						YES
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => column.setFilterValue(false)}
						className={column.getFilterValue() === false ? "bg-accent" : ""}
					>
						NO
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
	cell: ({ row }) => {
		const visibility = row.getValue("visibility") as boolean;
		return (
			<Badge
				className={cn(
					"w-full max-w-12 rounded-none font-semibold",
					visibility
						? "bg-green-500 hover:bg-green-600"
						: "bg-gray-500 hover:bg-gray-600",
				)}
			>
				{visibility ? "YES" : "NO"}
			</Badge>
		);
	},
	filterFn: (row, id, value) => {
		if (value === undefined) return true;
		return row.getValue(id) === value;
	},
};

// Function to get columns based on user role
export const getColumns = (userRole?: string): ColumnDef<Event>[] => {
	if (userRole === "org_owner") {
		// Insert visibility column after status column (index 3)
		const columnsWithVisibility = [...baseColumns];
		columnsWithVisibility.splice(3, 0, visibilityColumn);
		return columnsWithVisibility;
	}
	return baseColumns;
};

// Default export for backward compatibility
export const columns = baseColumns;
