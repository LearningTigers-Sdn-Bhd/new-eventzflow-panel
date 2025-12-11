"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/data-state";
import { getEventRentableItems } from "@/lib/api/event-rentable-item";
import { getCurrentPrice, getCurrentPriceTierLabel } from "@/lib/utils/price-tier";
import { useExhibitorCart } from "@/stores/exhibitor-cart-store";

interface ItemsCatalogProps {
	eventId: number;
}

export function ItemsCatalog({ eventId }: ItemsCatalogProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [quantities, setQuantities] = useState<Record<number, number>>({});
	const { addItem } = useExhibitorCart();

	const {
		data: eventItems = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event-rentable-items", eventId],
		queryFn: () => getEventRentableItems(eventId),
	});

	// Filter active items only
	const activeItems = eventItems.filter(
		(item) => item.rentableItem?.status === "active",
	);

	// Filter by search query
	const filteredItems = activeItems.filter((item) =>
		item.rentableItem?.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleAddToCart = (eventItem: typeof eventItems[0]) => {
		if (!eventItem.rentableItem) return;

		const quantity = quantities[eventItem.id] || 1;
		const currentPrice = getCurrentPrice(
			eventItem.eventRentableItemPriceTiers,
			eventItem.rentableItem.defaultPrice,
		);

		addItem({
			rentableItemId: eventItem.rentableItem.id,
			name: eventItem.rentableItem.name,
			unitOfMeasure: eventItem.rentableItem.unitOfMeasure,
			agreedPrice: currentPrice,
			quantity,
		});

		toast.success(`Added ${quantity} ${eventItem.rentableItem.name} to cart`);
		setQuantities((prev) => ({ ...prev, [eventItem.id]: 1 }));
	};

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-center">
					<Package className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
					<p className="mt-2 text-muted-foreground text-sm">Loading items...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<EmptyState
				title="Error loading items"
				description={(error as Error).message}
				icon={<Package />}
			/>
		);
	}

	return (
		<div className="space-y-6">
			{/* Search */}
			<div className="relative">
				<Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search items..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="rounded-none pl-9"
				/>
			</div>

			{/* Items Grid */}
			{filteredItems.length === 0 ? (
				<EmptyState
					title="No items available"
					description="There are no items available for this event yet."
					icon={<Package />}
				/>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredItems.map((eventItem) => {
						if (!eventItem.rentableItem) return null;

						const currentPrice = getCurrentPrice(
							eventItem.eventRentableItemPriceTiers,
							eventItem.rentableItem.defaultPrice,
						);
						const priceTierLabel = getCurrentPriceTierLabel(
							eventItem.eventRentableItemPriceTiers,
						);

						return (
							<Card key={eventItem.id} className="flex flex-col rounded-none">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1">
											<h3 className="font-semibold">
												{eventItem.rentableItem.name}
											</h3>
											{eventItem.rentableItem.description && (
												<p className="mt-1 text-muted-foreground text-sm">
													{eventItem.rentableItem.description}
												</p>
											)}
										</div>
										{priceTierLabel && (
											<Badge variant="secondary" className="shrink-0">
												{priceTierLabel}
											</Badge>
										)}
									</div>
								</CardHeader>

								<CardContent className="flex-1 pb-3">
									<div className="space-y-2">
										<div className="flex items-baseline justify-between">
											<span className="text-muted-foreground text-sm">
												Price per {eventItem.rentableItem.unitOfMeasure}
											</span>
											<span className="font-semibold text-lg">
												RM {currentPrice.toFixed(2)}
											</span>
										</div>

										{eventItem.rentableItem.itemCategory && (
											<div className="text-muted-foreground text-xs">
												Category: {eventItem.rentableItem.itemCategory.name}
											</div>
										)}
									</div>
								</CardContent>

								<CardFooter className="flex gap-2 pt-3">
									<div className="flex-1">
										<Label htmlFor={`qty-${eventItem.id}`} className="sr-only">
											Quantity
										</Label>
										<Input
											id={`qty-${eventItem.id}`}
											type="number"
											min="1"
											value={quantities[eventItem.id] || 1}
											onChange={(e) =>
												setQuantities((prev) => ({
													...prev,
													[eventItem.id]: Number.parseInt(e.target.value) || 1,
												}))
											}
											className="h-9 rounded-none"
										/>
									</div>
									<Button
										onClick={() => handleAddToCart(eventItem)}
										size="sm"
										className="gap-2 rounded-none"
									>
										<Plus className="h-4 w-4" />
										Add
									</Button>
								</CardFooter>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
