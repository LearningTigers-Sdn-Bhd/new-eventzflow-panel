"use client";

import { useState } from "react";
import type { EventVendor } from "@/lib/api/event-vendor";
import { ManageKitsNavigation, type ManageKitsTab } from "./manage-kits-navigation";
import { ManageKitsInfoForm } from "./manage-kits-info-form";
import { ManageKitItemsForm } from "./manage-kit-items-form";
import { ManageKitPrintingsForm } from "./manage-kit-printings-form";

interface ManageKitsModalProps {
	vendor: EventVendor;
	showPrintingServices?: boolean;
	onClose?: () => void;
}

export function ManageKitsModal({
	vendor,
	showPrintingServices = true,
	onClose,
}: ManageKitsModalProps) {
	const [activeTab, setActiveTab] = useState<ManageKitsTab>("exhibitor-info");
	const kit = vendor.exhibitor_kit;

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
			</div>
		</div>
	);
}
