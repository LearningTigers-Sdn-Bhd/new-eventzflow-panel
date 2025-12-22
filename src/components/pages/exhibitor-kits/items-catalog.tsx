"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImageIcon, Minus, Package, Plus, Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/data-state";
import { getEventRentableItems } from "@/lib/api/event-rentable-item";
import { getCurrentPrice, getCurrentPriceTierLabel } from "@/lib/utils/price-tier";
import { useExhibitorCart } from "@/stores/exhibitor-cart-store";
import { cn } from "@/lib/utils";

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

	const handleQuantityChange = (id: number, delta: number) => {
		setQuantities((prev) => {
			const current = prev[id] || 1;
			const newValue = Math.max(1, current + delta);
			return { ...prev, [id]: newValue };
		});
	};

	const handleAddToCart = (eventItem: (typeof eventItems)[0]) => {
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
			imageUrl: eventItem.rentableItem.imageUrl,
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
				<div className="grid gap-4 sm:grid-cols-2">
					{filteredItems.map((eventItem) => {
						if (!eventItem.rentableItem) return null;

						const currentPrice = getCurrentPrice(
							eventItem.eventRentableItemPriceTiers,
							eventItem.rentableItem.defaultPrice,
						);
						const priceTierLabel = getCurrentPriceTierLabel(
							eventItem.eventRentableItemPriceTiers,
						);
						const quantity = quantities[eventItem.id] || 1;

						return (
							<div
								key={eventItem.id}
								className="group relative overflow-hidden border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-md"
							>
								{/* Top Accent Bar */}
								<div className="h-1 w-full bg-primary" />

								<div className="p-4">
									{/* Header: Image/Icon + Info */}
									<div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
										{/* Image/Icon Container */}
										<div className="flex h-40 w-full items-center justify-center overflow-hidden bg-primary/10 transition-colors group-hover:bg-primary/20 sm:h-20 sm:w-20 sm:shrink-0">
											{eventItem.rentableItem.imageUrl ? (
												<img
													src={eventItem.rentableItem.imageUrl}
													alt={eventItem.rentableItem.name}
													className="h-full w-full object-cover"
												/>
											) : (
												<ImageIcon className="h-12 w-12 text-primary sm:h-8 sm:w-8" />
											)}
										</div>

										{/* Info */}
										<div className="min-w-0 flex-1 space-y-2">
											<div className="flex items-start justify-between gap-2">
												<h3 className="font-semibold text-base leading-tight sm:text-sm line-clamp-2">
													{eventItem.rentableItem.name}
												</h3>
												{priceTierLabel && (
													<Badge
														variant="secondary"
														className="shrink-0 rounded-none text-[10px] px-1.5 py-0.5"
													>
														{priceTierLabel}
													</Badge>
												)}
											</div>
											{eventItem.rentableItem.description && (
												<p className="text-muted-foreground text-sm sm:text-xs line-clamp-2">
													{eventItem.rentableItem.description}
												</p>
											)}
											<div className="flex items-center justify-between gap-2">
												{eventItem.rentableItem.itemCategory && (
													<p className="text-muted-foreground/70 text-[10px] uppercase tracking-wide">
														{eventItem.rentableItem.itemCategory.name}
													</p>
												)}
												<p className="text-muted-foreground text-xs sm:hidden">
													{eventItem.rentableItem.unitOfMeasure}
												</p>
											</div>
										</div>
									</div>

									{/* Divider */}
									<div className="my-4 border-t border-dashed" />

									{/* Footer: Price + Actions */}
									<div className="space-y-3">
										{/* Price Section */}
										<div className="flex items-baseline justify-between">
											<div>
												<p className="text-muted-foreground text-[10px] uppercase tracking-wide">
													{eventItem.rentableItem.unitOfMeasure}
												</p>
												<p className="font-bold text-2xl text-primary sm:text-xl">
													RM {currentPrice.toFixed(2)}
												</p>
											</div>
											{priceTierLabel && (
												<Badge
													variant="secondary"
													className="sm:hidden shrink-0 rounded-none text-[10px] px-1.5 py-0.5"
												>
													{priceTierLabel}
												</Badge>
											)}
										</div>

										{/* Actions */}
										<div className="flex items-center gap-2">
											{/* Quantity Controls */}
											<div className="flex flex-1 items-center border sm:flex-initial">
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="h-10 w-10 rounded-none sm:h-9 sm:w-9 shrink-0"
													onClick={() => handleQuantityChange(eventItem.id, -1)}
													disabled={quantity <= 1}
												>
													<Minus className="h-4 w-4" />
												</Button>
												<span className="w-12 text-center text-base font-medium sm:w-10 sm:text-sm">
													{quantity}
												</span>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="h-10 w-10 rounded-none sm:h-9 sm:w-9 shrink-0"
													onClick={() => handleQuantityChange(eventItem.id, 1)}
												>
													<Plus className="h-4 w-4" />
												</Button>
											</div>

											{/* Add to Cart */}
											<Button
												onClick={() => handleAddToCart(eventItem)}
												size="sm"
												className="h-10 flex-1 gap-2 rounded-none px-4 sm:h-9"
											>
												<ShoppingCart className="h-4 w-4" />
												<span>Add to Cart</span>
											</Button>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
