"use client";

import { UserPlus } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import AssignStaffForm from "../assign-staff-form";

export function EventStaffPageButton() {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();
	const { user } = useAuth();

	const handleAssignStaff = () => {
		openDialog({
			component: AssignStaffForm,
			props: {
				eventId,
				onClose: closeDialog,
			},
			config: {
				title: "Assign Staff to Event",
				description: "Add a team member to this event's staff.",
				size: "lg",
			},
		});
	};

	// Only org_owner and organizer can assign staff
	if (user?.role !== "org_owner" && user?.role !== "organizer") {
		return null;
	}

	return (
		<div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
			<Button
				onClick={handleAssignStaff}
				className="w-full rounded-none py-6 md:w-auto md:py-4"
			>
				<UserPlus className="mr-2 h-4 w-4" />
				Assign Staff
			</Button>
		</div>
	);
}
