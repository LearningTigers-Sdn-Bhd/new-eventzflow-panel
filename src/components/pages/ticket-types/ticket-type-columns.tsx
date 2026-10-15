"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { TicketType } from "@/lib/api/ticket-type";
import { cn } from "@/lib/utils";
import { TicketTypeActionsMenu } from "./action-menu";
import { ActivePriceTierBadge } from "./active-price-tier-badge";
import { ActivePriceTierPrice } from "./active-price-tier-price";
import { PriceTierButton } from "./price-tier-button";

const columns: ColumnDef<TicketType>[] = [
	{
		accessorKey: "name",
		size: 200,
		header: ({ column }) => <SortableHeader column={column} label="Name" />,
		cell: ({ row }) => {
			const ticketType = row.original;
			return (
				<div className="font-medium">
					{ticketType.name}{" "}
					<span className="text-muted-foreground text-xs">
						(#{ticketType.id})
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "price",
		size: 150,
		header: ({ column }) => <SortableHeader column={column} label="Price" />,
		cell: ({ row }) => {
			const ticketType = row.original;
			return (
				<div className="space-y-1">
					<div className="font-medium">
						<ActivePriceTierPrice
							ticketTypeId={ticketType.id}
							basePrice={ticketType.price}
						/>
					</div>
					<ActivePriceTierBadge ticketTypeId={ticketType.id} />
				</div>
			);
		},
	},
	{
		accessorKey: "quantity",
		size: 120,
		header: ({ column }) => <SortableHeader column={column} label="Quantity" />,
		cell: ({ row }) => {
			const { quantity, remainingQuantity } = row.original;
			if (remainingQuantity == null) return <div>{quantity}</div>;

			return (
				<div className="flex items-center gap-1">
					<span className="font-medium">{remainingQuantity}</span>
					<span className="text-muted-foreground text-xs">/ {quantity}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "maxPerOrder",
		size: 120,
		header: () => <p className="font-medium">Max/Order</p>,
		cell: ({ row }) => <div>{row.getValue("maxPerOrder")}</div>,
	},
	{
		id: "priceTiers",
		size: 150,
		header: () => <div className="text-center font-medium">Price Tiers</div>,
		cell: ({ row }) => (
			<div className="flex justify-center">
				<PriceTierButton ticketType={row.original} />
			</div>
		),
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
