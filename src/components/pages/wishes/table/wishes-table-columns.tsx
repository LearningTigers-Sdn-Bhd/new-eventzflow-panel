"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { Wish } from "@/lib/api/wishes";
import { cn } from "@/lib/utils";
import { WishesActionMenu } from "./action-menu";

const STATUS_OPTIONS = [
	{ label: "Pending", value: "pending" },
	{ label: "Approved", value: "approved" },
	{ label: "Rejected", value: "rejected" },
];

export const getWishesColumns = (eventId: string): ColumnDef<Wish>[] => [
	{
		accessorKey: "guest_name",
		header: ({ column }) => (
			<SortableHeader column={column} label="Guest Name" />
		),
		cell: ({ row }) => (
			<div className="font-semibold">{row.getValue("guest_name")}</div>
		),
	},
	{
		accessorKey: "message",
		header: "Message",
		size: 500,
		cell: ({ row }) => (
			<div className="max-w-[600px] border-l-2 border-primary/20 py-2 pl-4">
				<p className="whitespace-pre-wrap font-medium text-foreground text-sm leading-relaxed italic">
					"{row.getValue("message")}"
				</p>
			</div>
		),
	},
	{
		accessorKey: "status",
		filterFn: (row, id, value) => {
			if (value === undefined) return true;
			return row.getValue(id) === value;
		},
		header: ({ column }) => (
			<FilterableHeader
				column={column}
				label="Status"
				options={STATUS_OPTIONS}
				allOptionLabel="All Status"
			/>
		),
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge
					variant={
						status === "pending"
							? "secondary"
							: status === "approved"
								? "default"
								: "destructive"
					}
					className={cn(
						"w-full min-w-20 max-w-24 rounded-none font-bold capitalize",
						status === "approved" &&
							"bg-emerald-500 text-white hover:bg-emerald-600",
						status === "pending" &&
							"bg-amber-500 text-white hover:bg-amber-600",
					)}
				>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "created_at",
		header: ({ column }) => (
			<SortableHeader column={column} label="Submitted On" />
		),
		cell: ({ row }) => {
			const date = row.getValue("created_at") as string;
			return (
				<div className="text-sm">
					{format(new Date(date), "d MMM yyyy, h:mm a")}
				</div>
			);
		},
	},
	{
		id: "actions",
		size: 140,
		enableHiding: false,
		meta: {
			sticky: "right",
		},
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => {
			return (
				<div className="flex justify-center">
					<WishesActionMenu wish={row.original} eventId={eventId} />
				</div>
			);
		},
	},
];
