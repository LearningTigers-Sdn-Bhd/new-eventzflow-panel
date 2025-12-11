"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/data-state";
import { getEventPrintingServices } from "@/lib/api/event-printing-service";
import { getCurrentPrice, getCurrentPriceTierLabel } from "@/lib/utils/price-tier";
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

	const handleAddToCart = (eventService: typeof eventServices[0]) => {
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
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredServices.map((eventService) => {
						if (!eventService.printingService) return null;

						const currentPrice = getCurrentPrice(
							eventService.eventPrintingServicePriceTiers,
							eventService.printingService.defaultPrice,
						);
						const priceTierLabel = getCurrentPriceTierLabel(
							eventService.eventPrintingServicePriceTiers,
						);

						return (
							<Card key={eventService.id} className="flex flex-col rounded-none">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1">
											<h3 className="font-semibold">
												{eventService.printingService.name}
											</h3>
											{eventService.printingService.description && (
												<p className="mt-1 text-muted-foreground text-sm">
													{eventService.printingService.description}
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
												Price per {eventService.printingService.unitOfMeasure}
											</span>
											<span className="font-semibold text-lg">
												RM {currentPrice.toFixed(2)}
											</span>
										</div>

										{eventService.printingService.itemCategory && (
											<div className="text-muted-foreground text-xs">
												Category:{" "}
												{eventService.printingService.itemCategory.name}
											</div>
										)}
									</div>
								</CardContent>

								<CardFooter className="flex gap-2 pt-3">
									<div className="flex-1">
										<Label htmlFor={`qty-${eventService.id}`} className="sr-only">
											Quantity
										</Label>
										<Input
											id={`qty-${eventService.id}`}
											type="number"
											min="1"
											value={quantities[eventService.id] || 1}
											onChange={(e) =>
												setQuantities((prev) => ({
													...prev,
													[eventService.id]:
														Number.parseInt(e.target.value) || 1,
												}))
											}
											className="h-9 rounded-none"
										/>
									</div>
									<Button
										onClick={() => handleAddToCart(eventService)}
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
