"use client";

import { UserPlus } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useAuth } from "@/hooks/use-auth";
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

	// Only org_owner can assign staff
	if (user?.role !== "org_owner") {
		return null;
	}

	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button onClick={handleAssignStaff} className="w-full lg:w-auto">
				<UserPlus className="mr-2 h-4 w-4" />
				Assign Staff
			</Button>
		</div>
	);
}
