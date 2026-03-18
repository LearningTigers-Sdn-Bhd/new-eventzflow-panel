"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Printer } from "lucide-react";
import { useState } from "react";
import { LoadingState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/auth/use-auth";
import { getEventById } from "@/lib/api/event";
import { isExhibitorManagementEnabled } from "../event/exhibitor-management-access";
import { CartSummary } from "./cart-summary";
import { ItemsCatalog } from "./items-catalog";
import { PrintingsCatalog } from "./printings-catalog";

interface OrderItemsPageProps {
	eventId: number;
	onCheckout?: () => void;
}

export function OrderItemsPage({ eventId, onCheckout }: OrderItemsPageProps) {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState("items");
	const { data: eventDetails, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(String(eventId)),
	});

	if (isLoadingEvent) {
		return (
			<LoadingState
				title="Loading feature access..."
				description="Checking event access for exhibitor kits..."
			/>
		);
	}

	if (!isExhibitorManagementEnabled(user?.role, eventDetails)) {
		return <FeatureLockedState isEventVendor />;
	}

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
