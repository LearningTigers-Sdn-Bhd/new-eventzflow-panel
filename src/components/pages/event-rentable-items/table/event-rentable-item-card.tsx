"use client";

import { DollarSign, MoreHorizontal, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import { useDialog } from "@/hooks/use-dialog";
import type { EventRentableItem } from "@/lib/api/event-rentable-item";
import { PriceTierDialog } from "../price-tier-dialog";

interface EventRentableItemCardProps {
	item: EventRentableItem;
}

export function EventRentableItemCard({ item }: EventRentableItemCardProps) {
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
		<Item className="rounded-none border">
			<ItemHeader>
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1">
						<ItemTitle>{item.rentableItem?.name || "-"}</ItemTitle>
						{item.rentableItem?.description && (
							<ItemDescription className="line-clamp-2">
								{item.rentableItem.description}
							</ItemDescription>
						)}
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 rounded-none p-0">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="rounded-none">
							<DropdownMenuItem onClick={handleManagePricing} className="rounded-none">
								<DollarSign className="mr-2 h-4 w-4" />
								Manage Pricing
							</DropdownMenuItem>
							<DropdownMenuItem className="rounded-none text-destructive">
								<Unlink className="mr-2 h-4 w-4" />
								Unlink Item
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</ItemHeader>
			<ItemContent>
				<div className="flex flex-wrap items-center gap-2">
					{item.rentableItem?.itemCategory && (
						<Badge variant="outline" className="rounded-none">
							{item.rentableItem.itemCategory.name}
						</Badge>
					)}
					<Badge variant="secondary" className="rounded-none">
						{item.rentableItem?.unitOfMeasure}
					</Badge>
					<Badge variant="secondary" className="rounded-none">
						RM {Number(item.rentableItem?.defaultPrice ?? 0).toFixed(2)}
					</Badge>
				</div>
				<Button
					size="sm"
					variant="outline"
					onClick={handleManagePricing}
					className="mt-3 w-full rounded-none"
				>
					<DollarSign className="mr-2 h-4 w-4" />
					Manage Pricing
				</Button>
			</ItemContent>
		</Item>
	);
}
