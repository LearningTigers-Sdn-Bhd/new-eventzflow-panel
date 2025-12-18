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
import type { ExhibitorKitPrinting } from "@/lib/api/exhibitor-kit";

export interface PrintingsTableMeta extends TableMeta<ExhibitorKitPrinting> {
	onEditPrinting?: (printing: ExhibitorKitPrinting) => void;
}

export const printingsColumns: ColumnDef<ExhibitorKitPrinting>[] = [
	{
		accessorKey: "printing_service.name",
		id: "name",
		size: 250,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Service Name</p>
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
				{row.original.printing_service?.name || "Unknown Service"}
			</div>
		),
	},
	{
		accessorKey: "printing_service.unit_of_measure",
		id: "unit",
		size: 120,
		header: () => <p className="font-medium">Unit</p>,
		cell: ({ row }) => (
			<Badge variant="outline" className="rounded-none">
				{row.original.printing_service?.unit_of_measure || "-"}
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
		accessorKey: "file_reference",
		size: 180,
		header: () => <p className="font-medium">File Reference</p>,
		cell: ({ row }) => {
			const fileRef = row.getValue("file_reference") as string | null;
			if (!fileRef) {
				return <div className="text-muted-foreground text-sm">-</div>;
			}
			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="max-w-[180px] cursor-default truncate text-muted-foreground text-sm">
							{fileRef}
						</div>
					</TooltipTrigger>
					<TooltipContent className="max-w-[300px] break-all">
						{fileRef}
					</TooltipContent>
				</Tooltip>
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
			const printing = row.original;
			const meta = table.options.meta as PrintingsTableMeta | undefined;

			return (
				<div className="flex justify-center">
					<Button
						variant="ghost"
						size="icon"
						className="rounded-none"
						onClick={() => meta?.onEditPrinting?.(printing)}
					>
						<Pencil className="size-4" />
					</Button>
				</div>
			);
		},
	},
];
