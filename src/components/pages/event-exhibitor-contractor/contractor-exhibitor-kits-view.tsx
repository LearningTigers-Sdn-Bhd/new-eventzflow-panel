"use client";

import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { getEventVendors } from "@/lib/api/event-vendor";
import { DataTable } from "../exhibitor-kits/my-items/data-table";
import { columns, type ExhibitorKitWithVendor } from "./exhibitor-kits-table/columns";

interface ContractorExhibitorKitsViewProps {
	eventId: string;
}

export function ContractorExhibitorKitsView({ eventId }: ContractorExhibitorKitsViewProps) {
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
				title="Loading exhibitor kits..."
				description="Please wait while we fetch exhibitor kits..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load exhibitor kits"
				description="We couldn't load exhibitor kits. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	// Extract exhibitor kits from vendors (same approach as admin)
	const kitsWithVendors: ExhibitorKitWithVendor[] = (vendors || [])
		.filter(vendor => vendor.exhibitor_kit) // Only vendors with exhibitor kits
		.map(vendor => ({
			...vendor.exhibitor_kit!,
			vendor: vendor,
		}));

	return (
		<div className="space-y-4">
			<DataTable
				columns={columns}
				data={kitsWithVendors}
				emptyTitle="No exhibitor kits found"
				emptyDescription="No exhibitor kits have been created for this event yet"
				emptyIcon={<Package />}
				searchPlaceholder="Search by company name or booth..."
				searchColumns={["company_name", "booth_number", "pic_full_name"]}
				statusFilter={{
					column: "payment_status",
					placeholder: "Filter by payment status",
					options: [
						{ label: "Paid", value: "paid" },
						{ label: "Unpaid", value: "unpaid" },
						{ label: "Waived", value: "waived" },
						{ label: "Sponsored", value: "sponsored" },
					],
				}}
			/>
		</div>
	);
}
