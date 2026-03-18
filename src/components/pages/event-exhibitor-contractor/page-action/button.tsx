"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { getEventById } from "@/lib/api/event";
import { getEventExhibitionContractor } from "@/lib/api/event-exhibition-contractor";
import { canManageExhibitorContractorAction } from "../../event/exhibitor-management-access";
import { AssignContractorDialog } from "../assign-contractor-dialog";
import { RemoveContractorDialog } from "../remove-contractor-dialog";

export function ExhibitorContractorPageButton() {
	const params = useParams();
	const eventId = params.event_id as string;
	const { user } = useAuth();
	const { openDialog, closeDialog } = useDialog();
	const { data: eventDetails } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});
	const canManageContractor = canManageExhibitorContractorAction(
		user?.role,
		eventDetails,
	);

	// Fetch the assigned contractor for this event
	const { data: eventContractor } = useQuery({
		queryKey: ["event", eventId, "exhibition-contractor"],
		queryFn: () => getEventExhibitionContractor(Number(eventId)),
		enabled: canManageContractor,
	});

	if (!canManageContractor) {
		return null;
	}

	const handleAssignContractor = () => {
		openDialog({
			component: AssignContractorDialog,
			props: {
				eventId: Number(eventId),
				onClose: closeDialog,
			},
			config: {
				title: "Assign Main Contractor",
				description: "Select a main contractor to assign to this event.",
				size: "lg",
			},
		});
	};

	const handleRemoveContractor = () => {
		openDialog({
			component: RemoveContractorDialog,
			props: {
				eventId: Number(eventId),
				contractorName:
					eventContractor?.contractor?.full_name || "this contractor",
				onClose: closeDialog,
			},
			config: {
				title: "Remove Main Contractor",
				size: "md",
			},
		});
	};

	// Show remove button if contractor is assigned, otherwise show assign button
	if (eventContractor?.contractor) {
		return (
			<Button
				variant="destructive"
				onClick={handleRemoveContractor}
				className="w-full rounded-none lg:w-auto"
			>
				<Trash2 className="mr-2 h-4 w-4" />
				Remove Contractor
			</Button>
		);
	}

	return (
		<Button
			onClick={handleAssignContractor}
			className="w-full rounded-none lg:w-auto"
		>
			<Plus className="mr-2 h-4 w-4" />
			Assign Contractor
		</Button>
	);
}
