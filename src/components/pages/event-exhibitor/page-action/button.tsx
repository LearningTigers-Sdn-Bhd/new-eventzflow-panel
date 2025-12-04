"use client";

import { Link2, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { InviteVendorDialog } from "../../event-vendors/dialogs/invite-vendor-dialog";
import AddExhibitorModal from "../forms/add-exhibitor";

export function ExhibitorPageButton() {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();
	const permissions = useEventPermissions(eventId);

	const handleAssignExhibitor = () => {
		openDialog({
			component: AddExhibitorModal,
			props: {
				eventId: Number(eventId),
				onClose: closeDialog,
			},
			config: {
				title: "Assign Exhibitor to Event",
				description: "Assign exhibitors to this event individually or from a group.",
				size: "full",
			},
		});
	};

	// Only event_admin (or org_owner) can assign exhibitors
	if (!permissions.canManageEventVendors) {
		return null;
	}

	const canInviteVendor = permissions.isOrganizer || permissions.isEventAdmin;

	return (
		<div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
			{canInviteVendor && (
				<InviteVendorDialog
					eventId={Number(eventId)}
					trigger={
						<Button variant="outline" className="w-full rounded-none sm:w-auto">
							<Link2 className="mr-2 h-4 w-4" />
							Invite Exhibitor
						</Button>
					}
				/>
			)}
			<Button
				onClick={handleAssignExhibitor}
				className="w-full rounded-none sm:w-auto"
			>
				<Plus className="mr-2 h-4 w-4" />
				Assign Exhibitor
			</Button>
		</div>
	);
}
