"use client";

import type { ColumnDef, TableMeta } from "@tanstack/react-table";
import { ArrowDown, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ExhibitorKitItem } from "@/lib/api/exhibitor-kit";

export interface ItemsTableMeta extends TableMeta<ExhibitorKitItem> {
	onEditNotes?: (item: ExhibitorKitItem) => void;
}

export const itemsColumns: ColumnDef<ExhibitorKitItem>[] = [
	{
		accessorKey: "rentable_item.name",
		id: "name",
		size: 250,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Item Name</p>
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
			<div className="font-medium">
				{row.original.rentable_item?.name || "Unknown Item"}
			</div>
		),
	},
	{
		accessorKey: "rentable_item.unit_of_measure",
		id: "unit",
		size: 120,
		header: () => <p className="font-medium">Unit</p>,
		cell: ({ row }) => (
			<Badge variant="outline" className="rounded-none">
				{row.original.rentable_item?.unit_of_measure || "-"}
			</Badge>
		),
	},
	{
		accessorKey: "quantity",
		size: 100,
		header: ({ column }) => {
			return (
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
			);
		},
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("quantity")}</div>
		),
	},
	{
		accessorKey: "agreed_price",
		size: 120,
		header: ({ column }) => {
			return (
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
			);
		},
		cell: ({ row }) => {
			const price = row.getValue("agreed_price") as number;
			return (
				<div className="font-medium">
					{new Intl.NumberFormat("en-MY", {
						style: "currency",
						currency: "MYR",
					}).format(price)}
				</div>
			);
		},
	},
	{
		id: "subtotal",
		size: 140,
		header: () => <p className="font-medium">Subtotal</p>,
		cell: ({ row }) => {
			const quantity = row.getValue("quantity") as number;
			const price = row.getValue("agreed_price") as number;
			const subtotal = quantity * price;
			return (
				<div className="font-semibold">
					{new Intl.NumberFormat("en-MY", {
						style: "currency",
						currency: "MYR",
					}).format(subtotal)}
				</div>
			);
		},
	},
	{
		accessorKey: "notes",
		size: 200,
		header: () => <p className="font-medium">Notes</p>,
		cell: ({ row }) => {
			const notes = row.getValue("notes") as string | null;
			if (!notes) {
				return <div className="text-muted-foreground text-sm">-</div>;
			}
			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="max-w-[200px] cursor-default truncate text-muted-foreground text-sm">
							{notes}
						</div>
					</TooltipTrigger>
					<TooltipContent className="max-w-[300px] break-all">
						{notes}
					</TooltipContent>
				</Tooltip>
			);
		},
	},
	{
		id: "actions",
		size: 80,
		header: () => <div className="text-center font-medium">Actions</div>,
		cell: ({ row, table }) => {
			const item = row.original;
			const meta = table.options.meta as ItemsTableMeta | undefined;

			return (
				<div className="flex justify-center">
					<Button
						variant="ghost"
						size="icon"
						className="rounded-none"
						onClick={() => meta?.onEditNotes?.(item)}
					>
						<Pencil className="size-4" />
					</Button>
				</div>
			);
		},
	},
];
