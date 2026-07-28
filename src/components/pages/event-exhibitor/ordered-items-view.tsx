"use client";

import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { getEventVendors } from "@/lib/api/event-vendor";
import { DataTable } from "../exhibitor-kits/my-items/data-table";
import { type ExhibitorKitItemWithVendor, itemsColumns } from "./items-columns";

interface OrderedItemsViewProps {
	eventId: string;
}

/**
 * Component for admins to view all ordered items across all exhibitor kits
 */
export function OrderedItemsView({ eventId }: OrderedItemsViewProps) {
	const {
		data: vendors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId, "vendors"],
		queryFn: () => getEventVendors(Number(eventId)),
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading ordered items..."
				description="Please wait while we fetch ordered items..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load ordered items"
				description="We couldn't load ordered items. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	// Aggregate all items from all exhibitor kits with vendor info
	const allItems: ExhibitorKitItemWithVendor[] = [];
	vendors?.forEach((vendor) => {
		vendor.exhibitor_kits.forEach((kit) => {
			kit.exhibitor_kit_items?.forEach((item) => {
				allItems.push({
					...item,
					vendor_name: vendor.vendor.full_name,
					vendor_email: vendor.vendor.email,
					booth_number: kit.booth_number,
					booth_name: kit.name_on_fascia,
				});
			});
		});
	});

	return (
		<div className="space-y-4">
			<DataTable
				columns={itemsColumns}
				data={allItems}
				emptyTitle="No items ordered yet"
				emptyDescription="No exhibitors have ordered any rentable items yet"
				emptyIcon={<Package />}
				searchPlaceholder="Search items or exhibitors..."
				searchColumns={["name", "vendor"]}
			/>
		</div>
	);
}
