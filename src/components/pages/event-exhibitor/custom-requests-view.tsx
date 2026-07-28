"use client";

import { useQuery } from "@tanstack/react-query";
import { FileQuestion } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { getEventVendors } from "@/lib/api/event-vendor";
import { DataTable } from "../exhibitor-kits/my-items/data-table";
import {
	type CustomRequestWithVendor,
	customRequestsColumns,
} from "./custom-requests-columns";

interface CustomRequestsViewProps {
	eventId: string;
}

/**
 * Component for admins to view and manage all custom requests across all exhibitor kits
 */
export function CustomRequestsView({ eventId }: CustomRequestsViewProps) {
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
				title="Loading custom requests..."
				description="Please wait while we fetch custom requests..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load custom requests"
				description="We couldn't load custom requests. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	// Aggregate all custom requests from all exhibitor kits with vendor info
	const allRequests: CustomRequestWithVendor[] = [];
	vendors?.forEach((vendor) => {
		vendor.exhibitor_kits.forEach((kit) => {
			kit.custom_requests?.forEach((request) => {
				allRequests.push({
					...request,
					vendor_name: vendor.vendor.full_name,
					vendor_email: vendor.vendor.email,
					exhibitor_kit_id: kit.id,
					event_id: Number(eventId),
					booth_number: kit.booth_number,
					booth_name: kit.name_on_fascia,
				});
			});
		});
	});

	return (
		<div className="space-y-4">
			<DataTable
				columns={customRequestsColumns}
				data={allRequests}
				emptyTitle="No custom requests yet"
				emptyDescription="No exhibitors have submitted any custom requests yet"
				emptyIcon={<FileQuestion />}
				searchPlaceholder="Search requests or exhibitors..."
				searchColumns={["description", "vendor"]}
				statusFilter={{
					column: "status",
					placeholder: "Filter by status",
					options: [
						{ label: "Pending", value: "pending" },
						{ label: "Approved", value: "approved" },
						{ label: "Rejected", value: "rejected" },
					],
				}}
			/>
		</div>
	);
}
