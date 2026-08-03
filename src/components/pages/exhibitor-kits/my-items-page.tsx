"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Package, Printer } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/auth/use-auth";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventById } from "@/lib/api/event";
import { getEventVendors } from "@/lib/api/event-vendor";
import { isExhibitorManagementEnabled } from "../event/exhibitor-management-access";
import { ExhibitorPaymentList } from "./exhibitor-payment-list";
import { DataTable } from "./my-items/data-table";
import { itemsColumns } from "./my-items/items-columns";
import { printingsColumns } from "./my-items/printings-columns";

interface MyItemsPageProps {
	eventId: number;
	eventVendorId: number;
	kitId: number;
}

export function MyItemsPage({
	eventId,
	eventVendorId,
	kitId,
}: MyItemsPageProps) {
	const { user } = useAuth();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("items");
	const { data: eventDetails, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(String(eventId)),
	});
	const canAccessExhibitorManagement = isExhibitorManagementEnabled(
		user?.role,
		eventDetails,
	);

	const {
		data: eventVendors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["events", eventId, "vendors"],
		queryFn: () => getEventVendors(eventId),
		enabled: canAccessExhibitorManagement,
	});

	// Find the current vendor and get their exhibitor kit
	const currentVendor = eventVendors?.find((ev) => ev.id === eventVendorId);
	const myKit = currentVendor?.exhibitor_kits.find((kit) => kit.id === kitId);

	const handleAddMoreItems = () => {
		router.push(`/event/${eventId}/exhibitor-kits/${kitId}/order-items`);
	};

	// Set the "Add More Items" button in the header
	useSetEventActions(
		<div className="flex items-center gap-2">
			<Button asChild variant="outline" className="rounded-none">
				<Link href={`/event/${eventId}/exhibitor-kits`}>
					<ArrowLeft className="mr-2 size-4" />
					Back to My Booths
				</Link>
			</Button>
			{canAccessExhibitorManagement && (
				<Button onClick={handleAddMoreItems} className="rounded-none">
					Add More Items
				</Button>
			)}
		</div>,
	);

	if (isLoadingEvent) {
		return (
			<LoadingState
				title="Loading feature access..."
				description="Checking event access for exhibitor kits..."
			/>
		);
	}

	if (!canAccessExhibitorManagement) {
		return <FeatureLockedState isEventVendor />;
	}

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
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
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
				<div className="border p-4">
					<div className="mb-3">
						<h3 className="font-medium text-sm">Total Items</h3>
					</div>
					<div className="font-bold text-2xl">{totalItems}</div>
					<p className="text-muted-foreground text-xs">
						{items.length} items, {printings.length} printings
					</p>
				</div>

				<div className="border p-4">
					<div className="mb-3">
						<h3 className="font-medium text-sm">Total Cost</h3>
					</div>
					<div className="font-bold text-2xl">
						{new Intl.NumberFormat("en-MY", {
							style: "currency",
							currency: "MYR",
						}).format(grandTotal)}
					</div>
					<p className="text-muted-foreground text-xs">
						Items:{" "}
						{new Intl.NumberFormat("en-MY", {
							style: "currency",
							currency: "MYR",
						}).format(itemsTotal)}{" "}
						| Printings:{" "}
						{new Intl.NumberFormat("en-MY", {
							style: "currency",
							currency: "MYR",
						}).format(printingsTotal)}
					</p>
				</div>
			</div>

			{/* Items, Printings and Payments Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-3 rounded-none">
					<TabsTrigger value="items" className="gap-2 rounded-none">
						<Package className="h-4 w-4" />
						Items ({items.length})
					</TabsTrigger>
					<TabsTrigger value="printings" className="gap-2 rounded-none">
						<Printer className="h-4 w-4" />
						Printings ({printings.length})
					</TabsTrigger>
					<TabsTrigger value="payments" className="gap-2 rounded-none">
						<CreditCard className="h-4 w-4" />
						Payments
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
						cardType="item"
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
						cardType="printing"
					/>
				</TabsContent>

				<TabsContent value="payments" className="mt-6">
					<ExhibitorPaymentList
						eventId={eventId.toString()}
						kitId={myKit.id.toString()}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
