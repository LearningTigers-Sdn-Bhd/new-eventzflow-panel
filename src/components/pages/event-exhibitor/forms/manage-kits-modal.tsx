"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LoadingState } from "@/components/data-state";
import { FeatureLockedState } from "@/components/feature-locked-state";
import { useAuth } from "@/hooks/auth/use-auth";
import { getEventById } from "@/lib/api/event";
import type { EventVendor } from "@/lib/api/event-vendor";
import { getEventVendors } from "@/lib/api/event-vendor";
import {
	isExhibitorManagementProtectedTab,
	shouldShowExhibitorManagementLockedState,
} from "../../event/exhibitor-management-access";
import { ManageKitItemsForm } from "./manage-kit-items-form";
import { ManageKitPrintingsForm } from "./manage-kit-printings-form";
import { ManageKitsInfoForm } from "./manage-kits-info-form";
import {
	ManageKitsNavigation,
	type ManageKitsTab,
} from "./manage-kits-navigation";

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
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<ManageKitsTab>("exhibitor-info");
	const { data: event, isLoading: isLoadingEvent } = useQuery({
		queryKey: ["event", initialVendor.event_id],
		queryFn: () => getEventById(initialVendor.event_id.toString()),
	});

	// Fetch fresh vendor data to ensure real-time updates
	const { data: vendors, isLoading } = useQuery({
		queryKey: ["event", initialVendor.event_id, "vendors"],
		queryFn: () => getEventVendors(initialVendor.event_id),
		refetchOnMount: "always",
		refetchOnWindowFocus: true,
	});

	// Find the current vendor from the fresh data
	const vendor =
		vendors?.find((v) => v.id === initialVendor.id) || initialVendor;
	const kit = vendor.exhibitor_kit;
	const isProtectedTab = isExhibitorManagementProtectedTab(activeTab);
	const showLockedState = shouldShowExhibitorManagementLockedState(
		activeTab,
		user?.role,
		event,
	);

	if (isLoading && !vendors) {
		return (
			<LoadingState
				title="Loading..."
				description="Fetching exhibitor kit data..."
			/>
		);
	}

	if (!kit) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				No exhibitor kit found.
			</div>
		);
	}

	return (
		<div className="relative flex flex-col gap-4 px-4 md:grid md:grid-cols-[200px_1fr] md:items-start md:gap-6 md:px-6">
			<ManageKitsNavigation
				activeTab={activeTab}
				onTabChange={setActiveTab}
				showPrintingServices={showPrintingServices}
				itemsCount={kit.exhibitor_kit_items?.length || 0}
				printingsCount={kit.exhibitor_kit_printings?.length || 0}
				customRequestsCount={kit.custom_requests?.length || 0}
			/>
			<div className="flex min-w-0 flex-col gap-4">
				{activeTab === "exhibitor-info" && (
					<ManageKitsInfoForm vendor={vendor} onClose={onClose} />
				)}
				{isProtectedTab && isLoadingEvent && (
					<LoadingState
						title="Loading feature access..."
						description="Checking subscription access for this feature..."
					/>
				)}
				{showLockedState && !isLoadingEvent && <FeatureLockedState />}
				{activeTab === "rentable-items" &&
					!isLoadingEvent &&
					!showLockedState && (
						<ManageKitItemsForm
							items={kit.exhibitor_kit_items || []}
							onClose={onClose}
						/>
					)}
				{activeTab === "printing-services" &&
					showPrintingServices &&
					!isLoadingEvent &&
					!showLockedState && (
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
