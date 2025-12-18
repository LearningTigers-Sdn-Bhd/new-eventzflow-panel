"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { TicketType } from "@/lib/api/ticket-type";
import { cn } from "@/lib/utils";
import { TicketTypeActionsMenu } from "./action-menu";

const columns: ColumnDef<TicketType>[] = [
	{
		accessorKey: "name",
		size: 200,
		header: ({ column }) => <SortableHeader column={column} label="Name" />,
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("name")}</div>
		),
	},
	{
		accessorKey: "price",
		size: 120,
		header: ({ column }) => <SortableHeader column={column} label="Price" />,
		cell: ({ row }) => {
			const price = row.getValue("price") as number;
			return <div className="text-muted-foreground">RM{price.toFixed(2)}</div>;
		},
	},
	{
		accessorKey: "quantity",
		size: 100,
		header: ({ column }) => <SortableHeader column={column} label="Quantity" />,
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
		header: ({ column }) => (
			<FilterableHeader
				column={column}
				label="Status"
				options={[
					{ label: "Draft", value: "draft" },
					{ label: "Published", value: "published" },
					{ label: "Archived", value: "archived" },
				]}
				allOptionLabel="All Status"
			/>
		),
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
		size: 120,
		enableHiding: false,
		meta: {
			sticky: "right",
		},
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => (
			<div className="flex justify-center">
				<TicketTypeActionsMenu ticketType={row.original} />
			</div>
		),
	},
];

export function generateColumns(): ColumnDef<TicketType>[] {
	return columns;
}
