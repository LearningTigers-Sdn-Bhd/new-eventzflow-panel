"use client";

import { format } from "date-fns";
import { Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { EventRentableItemPriceTier } from "@/lib/api/event-rentable-item-price";

interface PriceTierTableProps {
	priceTiers: EventRentableItemPriceTier[];
	onDelete: (id: number) => void;
	isDeleting: boolean;
}

export function PriceTierTable({
	priceTiers,
	onDelete,
	isDeleting,
}: PriceTierTableProps) {
	// Sort by start date
	const sortedTiers = [...priceTiers].sort(
		(a, b) =>
			new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
	);

	// Check if a tier is currently active
	const isCurrentlyActive = (tier: EventRentableItemPriceTier) => {
		const now = new Date();
		const start = new Date(tier.startDate);
		const end = tier.endDate ? new Date(tier.endDate) : null;

		return now >= start && (!end || now <= end);
	};

	if (priceTiers.length === 0) {
		return (
			<div className="rounded-none border p-8 text-center">
				<Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
				<p className="text-muted-foreground text-sm">
					No price tiers configured yet. Add your first tier to get started.
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-none border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Label</TableHead>
						<TableHead>Price</TableHead>
						<TableHead>Start Date</TableHead>
						<TableHead>End Date</TableHead>
						<TableHead className="w-[70px]">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedTiers.map((tier) => {
						const isActive = isCurrentlyActive(tier);
						return (
							<TableRow key={tier.id}>
								<TableCell>
									<div className="flex items-center gap-2">
										<span className="font-medium">{tier.label}</span>
										{isActive && (
											<Badge variant="default" className="rounded-none">
												Active
											</Badge>
										)}
									</div>
								</TableCell>
								<TableCell className="font-medium">
									RM {tier.price.toFixed(2)}
								</TableCell>
								<TableCell>
									<div className="text-sm">
										{format(new Date(tier.startDate), "MMM d, yyyy")}
										<div className="text-muted-foreground text-xs">
											{format(new Date(tier.startDate), "h:mm a")}
										</div>
									</div>
								</TableCell>
								<TableCell>
									{tier.endDate ? (
										<div className="text-sm">
											{format(new Date(tier.endDate), "MMM d, yyyy")}
											<div className="text-muted-foreground text-xs">
												{format(new Date(tier.endDate), "h:mm a")}
											</div>
										</div>
									) : (
										<span className="text-muted-foreground text-sm">
											No end date
										</span>
									)}
								</TableCell>
								<TableCell>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onDelete(tier.id)}
										disabled={isDeleting}
										className="h-8 w-8 rounded-none p-0 text-destructive hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
										<span className="sr-only">Delete</span>
									</Button>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
