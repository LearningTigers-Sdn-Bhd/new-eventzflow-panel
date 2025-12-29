"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, DollarSign, Unlink, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/hooks/use-dialog";
import type { EventRentableItem } from "@/lib/api/event-rentable-item";
import { PriceTierDialog } from "../price-tier-dialog";

interface GetColumnsProps {
	onUnlink: (eventRentableItemId: number, itemName: string) => void;
	isContractor?: boolean;
}

export function getColumns({ onUnlink, isContractor = false }: GetColumnsProps): ColumnDef<EventRentableItem>[] {
	const baseColumns: ColumnDef<EventRentableItem>[] = [
		{
			id: "name",
			accessorFn: (row) => row.rentableItem?.name ?? "",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="rounded-none px-0"
				>
					Item Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div>
						<div className="font-medium">{item.rentableItem?.name || "-"}</div>
						{item.rentableItem?.description && (
							<div className="line-clamp-1 text-muted-foreground text-sm">
								{item.rentableItem.description}
							</div>
						)}
					</div>
				);
			},
			size: 250,
		},
		{
			id: "category",
			accessorFn: (row) => row.rentableItem?.itemCategory?.name ?? "",
			header: "Category",
			cell: ({ row }) => {
				const category = row.original.rentableItem?.itemCategory;
				return category ? (
					<Badge variant="outline" className="rounded-none">
						{category.name}
					</Badge>
				) : (
					<span className="text-muted-foreground">-</span>
				);
			},
			size: 150,
		},
		{
			id: "unit",
			accessorFn: (row) => row.rentableItem?.unitOfMeasure ?? "",
			header: "Unit",
			cell: ({ row }) => (
				<span>{row.original.rentableItem?.unitOfMeasure || "-"}</span>
			),
			size: 100,
		},
		{
			id: "defaultPrice",
			accessorFn: (row) => row.rentableItem?.defaultPrice ?? 0,
			header: "Default Price",
			cell: ({ row }) => (
				<span className="font-medium">
					RM {row.original.rentableItem?.defaultPrice != null ? Number(row.original.rentableItem.defaultPrice).toFixed(2) : "0.00"}
				</span>
			),
			size: 120,
		},
	];

	// Only show Pricing and Actions columns for contractors
	if (isContractor) {
		baseColumns.push(
			{
				id: "priceTiers",
				header: "Pricing",
				cell: ({ row }) => {
					const item = row.original;
					return <PriceTiersCell item={item} />;
				},
				size: 120,
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => {
					const item = row.original;
					return <ActionsCell item={item} onUnlink={onUnlink} />;
				},
				size: 70,
			},
		);
	}

	return baseColumns;
}

function PriceTiersCell({ item }: { item: EventRentableItem }) {
	const { openDialog } = useDialog();

	const handleManagePricing = () => {
		openDialog({
			component: PriceTierDialog,
			props: {
				eventRentableItem: item,
			},
			config: {
				title: `Manage Pricing: ${item.rentableItem?.name}`,
				description: "Configure time-based pricing tiers for this item.",
				size: "xl",
			},
		});
	};

	return (
		<Button
			size="sm"
			variant="outline"
			onClick={handleManagePricing}
			className="h-7 rounded-none px-3"
		>
			<DollarSign className="mr-1 h-3 w-3" />
			Manage
		</Button>
	);
}

function ActionsCell({
	item,
	onUnlink,
}: {
	item: EventRentableItem;
	onUnlink: (id: number, itemName: string) => void;
}) {
	const { openDialog } = useDialog();

	const handleManagePricing = () => {
		openDialog({
			component: PriceTierDialog,
			props: {
				eventRentableItem: item,
			},
			config: {
				title: `Manage Pricing: ${item.rentableItem?.name}`,
				description: "Configure time-based pricing tiers for this item.",
				size: "xl",
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 rounded-none p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="rounded-none">
				<DropdownMenuItem onClick={handleManagePricing} className="rounded-none">
					<DollarSign className="mr-2 h-4 w-4" />
					Manage Pricing
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => onUnlink(item.id, item.rentableItem?.name || "this item")}
					className="rounded-none text-destructive"
				>
					<Unlink className="mr-2 h-4 w-4" />
					Unlink Item
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
