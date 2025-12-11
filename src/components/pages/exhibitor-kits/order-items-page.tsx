"use client";

import { useState } from "react";
import { Package, Printer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemsCatalog } from "./items-catalog";
import { PrintingsCatalog } from "./printings-catalog";
import { CartSummary } from "./cart-summary";

interface OrderItemsPageProps {
	eventId: number;
	onCheckout?: () => void;
}

export function OrderItemsPage({ eventId, onCheckout }: OrderItemsPageProps) {
	const [activeTab, setActiveTab] = useState("items");

	return (
		<div className="space-y-4 px-2 sm:space-y-6 md:px-4">
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Catalog Section */}
				<div className="lg:col-span-2">
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-2 rounded-none">
							<TabsTrigger value="items" className="gap-2 rounded-none">
								<Package className="h-4 w-4" />
								Rentable Items
							</TabsTrigger>
							<TabsTrigger value="printings" className="gap-2 rounded-none">
								<Printer className="h-4 w-4" />
								Printing Services
							</TabsTrigger>
						</TabsList>

						<TabsContent value="items" className="mt-6">
							<ItemsCatalog eventId={eventId} />
						</TabsContent>

						<TabsContent value="printings" className="mt-6">
							<PrintingsCatalog eventId={eventId} />
						</TabsContent>
					</Tabs>
				</div>

				{/* Cart Summary - Sticky */}
				<div className="lg:col-span-1">
					<div className="sticky top-6">
						<CartSummary eventId={eventId} onCheckout={onCheckout} />
					</div>
				</div>
			</div>
		</div>
	);
}
