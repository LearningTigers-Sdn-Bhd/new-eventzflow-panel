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
import type { EventPrintingService } from "@/lib/api/event-printing-service";
import { PriceTierDialog } from "../price-tier-dialog";

interface EventPrintingServiceCardProps {
	service: EventPrintingService;
}

export function EventPrintingServiceCard({ service }: EventPrintingServiceCardProps) {
	const { openDialog } = useDialog();

	const handleManagePricing = () => {
		openDialog({
			component: PriceTierDialog,
			props: {
				eventPrintingService: service,
			},
			config: {
				title: `Manage Pricing: ${service.printingService?.name}`,
				description: "Configure time-based pricing tiers for this service.",
				size: "xl",
			},
		});
	};

	return (
		<Item className="rounded-none border">
			<ItemHeader>
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1">
						<ItemTitle>{service.printingService?.name || "-"}</ItemTitle>
						{service.printingService?.description && (
							<ItemDescription className="line-clamp-2">
								{service.printingService.description}
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
								Unlink Service
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</ItemHeader>
			<ItemContent>
				<div className="flex flex-wrap items-center gap-2">
					{service.printingService?.itemCategory && (
						<Badge variant="outline" className="rounded-none">
							{service.printingService.itemCategory.name}
						</Badge>
					)}
					<Badge variant="secondary" className="rounded-none">
						{service.printingService?.unitOfMeasure}
					</Badge>
					<Badge variant="secondary" className="rounded-none">
						RM {Number(service.printingService?.defaultPrice).toFixed(2)}
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
