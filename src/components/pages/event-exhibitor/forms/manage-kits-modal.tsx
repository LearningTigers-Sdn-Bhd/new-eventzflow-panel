"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { EventVendor } from "@/lib/api/event-vendor";
import { getEventVendors } from "@/lib/api/event-vendor";
import { LoadingState } from "@/components/data-state";
import { ManageKitsNavigation, type ManageKitsTab } from "./manage-kits-navigation";
import { ManageKitsInfoForm } from "./manage-kits-info-form";
import { ManageKitItemsForm } from "./manage-kit-items-form";
import { ManageKitPrintingsForm } from "./manage-kit-printings-form";
import { ManageKitCustomRequestsForm } from "./manage-kit-custom-requests-form";

interface ManageKitsModalProps {
	vendor: EventVendor;
	showPrintingServices?: boolean;
	onClose?: () => void;
}

export function ManageKitsModal({
	vendor: initialVendor,
	showPrintingServices = true,
	onClose,
}: ManageKitsModalProps) {
	const [activeTab, setActiveTab] = useState<ManageKitsTab>("exhibitor-info");

	// Fetch fresh vendor data to ensure real-time updates
	const { data: vendors, isLoading } = useQuery({
		queryKey: ["event", initialVendor.event_id, "vendors"],
		queryFn: () => getEventVendors(initialVendor.event_id),
		refetchOnMount: "always",
		refetchOnWindowFocus: true,
	});

	// Find the current vendor from the fresh data
	const vendor = vendors?.find((v) => v.id === initialVendor.id) || initialVendor;
	const kit = vendor.exhibitor_kit;

	if (isLoading && !vendors) {
		return <LoadingState title="Loading..." description="Fetching exhibitor kit data..." />;
	}

	if (!kit) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				No exhibitor kit found.
			</div>
		);
	}

	return (
		<div className="relative flex flex-col gap-4 px-4 md:px-6 md:grid md:grid-cols-[200px_1fr] md:items-start md:gap-6">
			<ManageKitsNavigation
				activeTab={activeTab}
				onTabChange={setActiveTab}
				showPrintingServices={showPrintingServices}
				itemsCount={kit.exhibitor_kit_items?.length || 0}
				printingsCount={kit.exhibitor_kit_printings?.length || 0}
				customRequestsCount={kit.custom_requests?.length || 0}
			/>
			<div className="flex flex-col gap-4 min-w-0">
				{activeTab === "exhibitor-info" && (
					<ManageKitsInfoForm vendor={vendor} onClose={onClose} />
				)}
				{activeTab === "rentable-items" && (
					<ManageKitItemsForm
						items={kit.exhibitor_kit_items || []}
						onClose={onClose}
					/>
				)}
				{activeTab === "printing-services" && showPrintingServices && (
					<ManageKitPrintingsForm
						printings={kit.exhibitor_kit_printings || []}
						onClose={onClose}
					/>
				)}
				{/* HIDDEN: Custom Requests feature temporarily disabled */}
				{/* {activeTab === "custom-requests" && (
					<ManageKitCustomRequestsForm
						customRequests={kit.custom_requests || []}
						vendorName={vendor.vendor.full_name}
						vendorEmail={vendor.vendor.email}
						eventId={vendor.event_id}
						exhibitorKitId={kit.id}
						onClose={onClose}
					/>
				)} */}
			</div>
		</div>
	);
}
