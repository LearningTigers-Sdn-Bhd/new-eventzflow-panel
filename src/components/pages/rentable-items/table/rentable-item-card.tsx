"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/use-format-date";
import type { RentableItem } from "@/lib/api/rentable-item";
import { RentableItemActionsMenu } from "./action-menu";

interface RentableItemCardProps {
	item: RentableItem;
}

export function RentableItemCard({ item }: RentableItemCardProps) {
	const { formatDate } = useFormatDate();

	const formattedPrice = new Intl.NumberFormat("en-MY", {
		style: "currency",
		currency: "MYR",
	}).format(item.defaultPrice);

	return (
		<Card className="rounded-none border-primary/20 shadow-none">
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<h3 className="font-semibold">{item.name}</h3>
							<Badge
								variant={item.status === "active" ? "default" : "secondary"}
								className="rounded-none capitalize"
							>
								{item.status}
							</Badge>
						</div>
						{item.description && (
							<p className="text-muted-foreground text-sm line-clamp-2">
								{item.description}
							</p>
						)}
						<div className="flex flex-wrap gap-2 text-sm">
							<Badge variant="outline" className="rounded-none">
								{item.itemCategory?.name ?? "No Category"}
							</Badge>
							<span className="text-muted-foreground">
								{formattedPrice} / {item.unitOfMeasure}
							</span>
						</div>
						<p className="text-muted-foreground text-xs">
							Created: {formatDate(item.createdAt)}
						</p>
					</div>
					<RentableItemActionsMenu item={item} />
				</div>
			</CardContent>
		</Card>
	);
}
