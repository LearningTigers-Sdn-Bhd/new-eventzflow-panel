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
	email: string;
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

export const columns: ColumnDef<BaseTicket>[] = [
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
			<div className="font-medium">{row.getValue("name")}</div>
		),
	},
	{
		accessorKey: "email",
		size: 220,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Email</p>
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
			<div className="font-medium">{row.getValue("email")}</div>
		),
	},
	{
		accessorKey: "phone",
		size: 140,
		header: "Phone Number",
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("phone")}</div>
		),
	},
	{
		accessorKey: "ticketTypeName",
		size: 140,
		header: "Ticket Type",
		cell: ({ row }) => (
			<div className="font-medium">
				{row.getValue("ticketTypeName") || "N/A"}
			</div>
		),
	},
	{
		accessorKey: "value",
		size: 120,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Ticket Price</p>
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
		cell: ({ row }) => {
			const value = row.getValue("value");
			// Handle both number and string values
			const price =
				typeof value === "number" ? value : parseFloat(value as string) || 0;
			return <div className="font-medium">${price.toFixed(2)}</div>;
		},
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
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "createdAt",
		size: 140,
		header: ({ column }) => {
			return (
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
			);
		},
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
		cell: ({ row }) => {
			const ticket = row.original;
			return (
				<div className="flex justify-center">
					<TicketActionsMenu ticket={ticket} />
				</div>
			);
		},
	},
];
