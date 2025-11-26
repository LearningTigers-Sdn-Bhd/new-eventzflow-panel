"use client";

import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import AddVendorModal from "../forms/add-vendor";

export function EventVendorsPageButton() {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();
	const permissions = useEventPermissions(eventId);

	const handleAssignVendor = () => {
		openDialog({
			component: AddVendorModal,
			props: {
				eventId: Number(eventId),
				onClose: closeDialog,
			},
			config: {
				title: "Assign Vendor to Event",
				description: "Assign vendors to this event individually or from a group.",
				size: "full",
			},
		});
	};

	// Only event_admin (or org_owner) can assign vendors
	if (!permissions.canManageEventVendors) {
		return null;
	}

	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button
				onClick={handleAssignVendor}
				className="w-full rounded-none lg:w-auto"
			>
				<Plus className="mr-2 h-4 w-4" />
				Assign Vendor
			</Button>
		</div>
	);
}
