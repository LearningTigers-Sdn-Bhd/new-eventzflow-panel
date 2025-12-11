"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Printer } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getEventVendors } from "@/lib/api/event-vendor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/data-state";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { DataTable } from "./my-items/data-table";
import { itemsColumns } from "./my-items/items-columns";
import { printingsColumns } from "./my-items/printings-columns";

interface MyItemsPageProps {
	eventId: number;
	eventVendorId: number;
}

export function MyItemsPage({ eventId, eventVendorId }: MyItemsPageProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("items");

	const {
		data: eventVendors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["events", eventId, "vendors"],
		queryFn: () => getEventVendors(eventId),
	});

	// Find the current vendor and get their exhibitor kit
	const currentVendor = eventVendors?.find((ev) => ev.id === eventVendorId);
	const myKit = currentVendor?.exhibitor_kit;

	const handleAddMoreItems = () => {
		router.push(`/event/${eventId}/my-exhibitor-kit/order-items` as any);
	};

	// Set the "Add More Items" button in the header
	useSetEventActions(
		<Button onClick={handleAddMoreItems} className="rounded-none">
			Add More Items
		</Button>,
	);

	if (isLoading) {
		return (
			<div className="space-y-6 px-2 py-6 md:px-4">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="px-2 py-6 md:px-4">
				<ErrorState
					title="Failed to load your items"
					description="We couldn't load your exhibitor kit items. Please try again."
					action={<Button onClick={() => window.location.reload()}>Retry</Button>}
				/>
			</div>
		);
	}

	if (!myKit) {
		return (
			<div className="space-y-6 p-0">
				<Card className="rounded-none">
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<Package className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">No Items Yet</h3>
						<p className="mb-4 text-muted-foreground text-sm">
							You haven't ordered any items or services yet.
						</p>
						<Button onClick={handleAddMoreItems} className="rounded-none">
							Browse Catalog
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const items = myKit.exhibitor_kit_items || [];
	const printings = myKit.exhibitor_kit_printings || [];
	const totalItems = items.length + printings.length;

	const itemsTotal = items.reduce(
		(sum, item) => sum + item.quantity * item.agreed_price,
		0,
	);
	const printingsTotal = printings.reduce(
		(sum, printing) => sum + printing.quantity * printing.agreed_price,
		0,
	);
	const grandTotal = itemsTotal + printingsTotal;

	return (
		<div className="space-y-6 p-0">
			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card className="rounded-none">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Total Items</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{totalItems}</div>
						<p className="text-muted-foreground text-xs">
							{items.length} items, {printings.length} printings
						</p>
					</CardContent>
				</Card>

				<Card className="rounded-none">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Total Cost</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{new Intl.NumberFormat("en-MY", {
								style: "currency",
								currency: "MYR",
							}).format(grandTotal)}
						</div>
						<p className="text-muted-foreground text-xs">
							Items: {new Intl.NumberFormat("en-MY", {
								style: "currency",
								currency: "MYR",
							}).format(itemsTotal)} | Printings: {new Intl.NumberFormat("en-MY", {
								style: "currency",
								currency: "MYR",
							}).format(printingsTotal)}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Items and Printings Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-2 rounded-none">
					<TabsTrigger value="items" className="gap-2 rounded-none">
						<Package className="h-4 w-4" />
						Rentable Items ({items.length})
					</TabsTrigger>
					<TabsTrigger value="printings" className="gap-2 rounded-none">
						<Printer className="h-4 w-4" />
						Printing Services ({printings.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="items" className="mt-6">
					<DataTable
						columns={itemsColumns}
						data={items}
						emptyTitle="No rentable items ordered yet"
						emptyDescription="Browse the catalog to add items to your exhibitor kit"
						emptyIcon={<Package />}
						searchPlaceholder="Search items..."
					/>
				</TabsContent>

				<TabsContent value="printings" className="mt-6">
					<DataTable
						columns={printingsColumns}
						data={printings}
						emptyTitle="No printing services ordered yet"
						emptyDescription="Browse the catalog to add printing services to your exhibitor kit"
						emptyIcon={<Printer />}
						searchPlaceholder="Search services..."
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
