"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExhibitorKitPrinting } from "@/lib/api/exhibitor-kit";

// Extended type to include vendor info
export type ExhibitorKitPrintingWithVendor = ExhibitorKitPrinting & {
	vendor_name: string;
	vendor_email: string;
};

export const printingsColumns: ColumnDef<ExhibitorKitPrintingWithVendor>[] = [
	{
		accessorKey: "vendor_name",
		id: "vendor",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Exhibitor</p>
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
			<div>
				<div className="font-medium">{row.getValue("vendor")}</div>
				<div className="text-muted-foreground text-xs">{row.original.vendor_email}</div>
			</div>
		),
	},
	{
		accessorKey: "printing_service.name",
		id: "name",
		size: 220,
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
		size: 100,
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
					<p className="font-medium">Qty</p>
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
		size: 130,
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
		size: 150,
		header: () => <p className="font-medium">File</p>,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("file_reference") || "-"}
			</div>
		),
	},
	{
		accessorKey: "notes",
		size: 180,
		header: () => <p className="font-medium">Notes</p>,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("notes") || "-"}
			</div>
		),
	},
];
