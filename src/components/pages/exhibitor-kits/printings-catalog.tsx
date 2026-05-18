"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ImageIcon,
	Minus,
	Plus,
	Printer,
	Search,
	ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEventPrintingServices } from "@/lib/api/event-printing-service";
import {
	getCurrentPrice,
	getCurrentPriceTierLabel,
} from "@/lib/utils/price-tier";
import { useExhibitorCart } from "@/stores/exhibitor-cart-store";

interface PrintingsCatalogProps {
	eventId: number;
}

export function PrintingsCatalog({ eventId }: PrintingsCatalogProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [quantities, setQuantities] = useState<Record<number, number>>({});
	const { addPrinting } = useExhibitorCart();

	const {
		data: eventServices = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event-printing-services", eventId],
		queryFn: () => getEventPrintingServices(eventId),
	});

	// Filter active services only
	const activeServices = eventServices.filter(
		(service) => service.printingService?.status === "active",
	);

	// Filter by search query
	const filteredServices = activeServices.filter((service) =>
		service.printingService?.name
			.toLowerCase()
			.includes(searchQuery.toLowerCase()),
	);

	const handleQuantityChange = (id: number, delta: number) => {
		setQuantities((prev) => {
			const current = prev[id] || 1;
			const newValue = Math.max(1, current + delta);
			return { ...prev, [id]: newValue };
		});
	};

	const handleAddToCart = (eventService: (typeof eventServices)[0]) => {
		if (!eventService.printingService) return;

		const quantity = quantities[eventService.id] || 1;
		const currentPrice = getCurrentPrice(
			eventService.eventPrintingServicePriceTiers,
			eventService.printingService.defaultPrice,
		);

		addPrinting({
			printingServiceId: eventService.printingService.id,
			name: eventService.printingService.name,
			unitOfMeasure: eventService.printingService.unitOfMeasure,
			agreedPrice: currentPrice,
			quantity,
			imageUrl: eventService.printingService.imageUrl,
		});

		toast.success(
			`Added ${quantity} ${eventService.printingService.name} to cart`,
		);
		setQuantities((prev) => ({ ...prev, [eventService.id]: 1 }));
	};

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-center">
					<Printer className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
					<p className="mt-2 text-muted-foreground text-sm">
						Loading printing services...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<EmptyState
				title="Error loading printing services"
				description={(error as Error).message}
				icon={<Printer />}
			/>
		);
	}

	return (
		<div className="space-y-6">
			{/* Search */}
			<div className="relative">
				<Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search printing services..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="rounded-none pl-9"
				/>
			</div>

			{/* Services Grid */}
			{filteredServices.length === 0 ? (
				<EmptyState
					title="No printing services available"
					description="There are no printing services available for this event yet."
					icon={<Printer />}
				/>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{filteredServices.map((eventService) => {
						if (!eventService.printingService) return null;

						const currentPrice = getCurrentPrice(
							eventService.eventPrintingServicePriceTiers,
							eventService.printingService.defaultPrice,
						);
						const priceTierLabel = getCurrentPriceTierLabel(
							eventService.eventPrintingServicePriceTiers,
						);
						const quantity = quantities[eventService.id] || 1;

						return (
							<div
								key={eventService.id}
								className="group relative overflow-hidden border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-md"
							>
								{/* Top Accent Bar */}
								<div className="h-1 w-full bg-primary" />

								<div className="p-4">
									{/* Header: Image/Icon + Info */}
									<div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
										{/* Image/Icon Container */}
										<div className="flex h-40 w-full items-center justify-center overflow-hidden bg-primary/10 transition-colors group-hover:bg-primary/20 sm:h-20 sm:w-20 sm:shrink-0">
											{eventService.printingService.imageUrl ? (
												<img
													src={eventService.printingService.imageUrl}
													alt={eventService.printingService.name}
													className="h-full w-full object-cover"
												/>
											) : (
												<ImageIcon className="h-12 w-12 text-primary sm:h-8 sm:w-8" />
											)}
										</div>

										{/* Info */}
										<div className="min-w-0 flex-1 space-y-2">
											<div className="flex items-start justify-between gap-2">
												<h3 className="line-clamp-2 font-semibold text-base leading-tight sm:text-sm">
													{eventService.printingService.name}
												</h3>
												{priceTierLabel && (
													<Badge
														variant="secondary"
														className="shrink-0 rounded-none px-1.5 py-0.5 text-[10px]"
													>
														{priceTierLabel}
													</Badge>
												)}
											</div>
											{eventService.printingService.description && (
												<p className="line-clamp-2 text-muted-foreground text-sm sm:text-xs">
													{eventService.printingService.description}
												</p>
											)}
											<div className="flex items-center justify-between gap-2">
												{eventService.printingService.itemCategory && (
													<p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">
														{eventService.printingService.itemCategory.name}
													</p>
												)}
												<p className="text-muted-foreground text-xs sm:hidden">
													{eventService.printingService.unitOfMeasure}
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
												<p className="text-[10px] text-muted-foreground uppercase tracking-wide">
													{eventService.printingService.unitOfMeasure}
												</p>
												<p className="font-bold text-2xl text-primary sm:text-xl">
													RM {currentPrice.toFixed(2)}
												</p>
											</div>
											{priceTierLabel && (
												<Badge
													variant="secondary"
													className="shrink-0 rounded-none px-1.5 py-0.5 text-[10px] sm:hidden"
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
													className="h-10 w-10 shrink-0 rounded-none sm:h-9 sm:w-9"
													onClick={() =>
														handleQuantityChange(eventService.id, -1)
													}
													disabled={quantity <= 1}
												>
													<Minus className="h-4 w-4" />
												</Button>
												<span className="w-12 text-center font-medium text-base sm:w-10 sm:text-sm">
													{quantity}
												</span>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="h-10 w-10 shrink-0 rounded-none sm:h-9 sm:w-9"
													onClick={() =>
														handleQuantityChange(eventService.id, 1)
													}
												>
													<Plus className="h-4 w-4" />
												</Button>
											</div>

											{/* Add to Cart */}
											<Button
												onClick={() => handleAddToCart(eventService)}
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
