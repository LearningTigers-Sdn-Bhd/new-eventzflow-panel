"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, Package, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDialog } from "@/hooks/use-dialog";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import { getEventVendors } from "@/lib/api/event-vendor";
import type {
	ExhibitorKitItem,
	ExhibitorKitPrinting,
} from "@/lib/api/exhibitor-kit";
import { ExhibitorPaymentList } from "./exhibitor-payment-list";
import { DataTable } from "./my-items/data-table";
import { EditItemNotesForm } from "./my-items/edit-item-notes-form";
import { EditPrintingForm } from "./my-items/edit-printing-form";
import type { ItemsTableMeta } from "./my-items/items-columns";
import { itemsColumns } from "./my-items/items-columns";
import type { PrintingsTableMeta } from "./my-items/printings-columns";
import { printingsColumns } from "./my-items/printings-columns";

interface MyItemsPageProps {
	eventId: number;
	eventVendorId: number;
}

export function MyItemsPage({ eventId, eventVendorId }: MyItemsPageProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("items");
	const { openDialog, closeDialog } = useDialog();

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
		router.push(`/event/${eventId}/my-exhibitor-kit/order-items`);
	};

	const handleEditItemNotes = useCallback(
		(item: ExhibitorKitItem) => {
			if (!myKit) return;
			openDialog({
				component: EditItemNotesForm,
				props: {
					eventId,
					kitId: myKit.id,
					item,
					onSuccess: closeDialog,
				},
				config: {
					title: "Edit Item Notes",
					size: "md",
				},
			});
		},
		[myKit, eventId, openDialog, closeDialog],
	);

	const handleEditPrinting = useCallback(
		(printing: ExhibitorKitPrinting) => {
			if (!myKit) return;
			openDialog({
				component: EditPrintingForm,
				props: {
					eventId,
					kitId: myKit.id,
					printing,
					onSuccess: closeDialog,
				},
				config: {
					title: "Edit Printing Details",
					size: "md",
				},
			});
		},
		[myKit, eventId, openDialog, closeDialog],
	);

	const itemsTableMeta: ItemsTableMeta = useMemo(
		() => ({
			onEditNotes: handleEditItemNotes,
		}),
		[handleEditItemNotes],
	);

	const printingsTableMeta: PrintingsTableMeta = useMemo(
		() => ({
			onEditPrinting: handleEditPrinting,
		}),
		[handleEditPrinting],
	);

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
						meta={itemsTableMeta}
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
						meta={printingsTableMeta}
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
