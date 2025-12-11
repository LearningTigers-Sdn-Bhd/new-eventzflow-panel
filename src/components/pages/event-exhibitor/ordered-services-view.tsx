"use client";

import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { getEventVendors } from "@/lib/api/event-vendor";
import { DataTable } from "../exhibitor-kits/my-items/data-table";
import { printingsColumns, type ExhibitorKitPrintingWithVendor } from "./printings-columns";

interface OrderedServicesViewProps {
	eventId: string;
}

/**
 * Component for admins to view all ordered printing services across all exhibitor kits
 */
export function OrderedServicesView({ eventId }: OrderedServicesViewProps) {
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
				title="Loading ordered services..."
				description="Please wait while we fetch ordered services..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load ordered services"
				description="We couldn't load ordered services. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	// Aggregate all printings from all exhibitor kits with vendor info
	const allPrintings: ExhibitorKitPrintingWithVendor[] = [];
	vendors?.forEach((vendor) => {
		if (vendor.exhibitor_kit?.exhibitor_kit_printings) {
			vendor.exhibitor_kit.exhibitor_kit_printings.forEach((printing) => {
				allPrintings.push({
					...printing,
					vendor_name: vendor.vendor.full_name,
					vendor_email: vendor.vendor.email,
				});
			});
		}
	});

	return (
		<div className="space-y-4">
			<DataTable
				columns={printingsColumns}
				data={allPrintings}
				emptyTitle="No services ordered yet"
				emptyDescription="No exhibitors have ordered any printing services yet"
				emptyIcon={<Printer />}
				searchPlaceholder="Search services or exhibitors..."
				searchColumns={["name", "vendor"]}
			/>
		</div>
	);
}
