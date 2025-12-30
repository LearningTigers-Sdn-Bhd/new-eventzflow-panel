"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { getContractors } from "@/lib/api/contractor";
import { getEventExhibitionContractor } from "@/lib/api/event-exhibition-contractor";
import { AssignContractorDialog } from "../assign-contractor-dialog";
import { RemoveContractorDialog } from "../remove-contractor-dialog";

export function ExhibitorContractorPageButton() {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();

	// Fetch the assigned contractor for this event
	const { data: eventContractor } = useQuery({
		queryKey: ["event", eventId, "exhibition-contractor"],
		queryFn: () => getEventExhibitionContractor(Number(eventId)),
	});

	// Fetch all contractors to get the details
	const { data: allContractors } = useQuery({
		queryKey: ["contractors"],
		queryFn: () => getContractors(),
	});

	// Find the assigned contractor details
	const assignedContractor = allContractors?.find(
		(c) =>
			c.exhibition_contractor_profile?.id ===
			eventContractor?.exhibition_contractor_profile_id,
	);

	const handleAssignContractor = () => {
		openDialog({
			component: AssignContractorDialog,
			props: {
				eventId: Number(eventId),
				onClose: closeDialog,
			},
			config: {
				title: "Assign Exhibitor Contractor",
				description: "Select an exhibitor contractor to assign to this event.",
				size: "lg",
			},
		});
	};

	const handleRemoveContractor = () => {
		openDialog({
			component: RemoveContractorDialog,
			props: {
				eventId: Number(eventId),
				contractorName: assignedContractor?.full_name || "this contractor",
				onClose: closeDialog,
			},
			config: {
				title: "Remove Exhibitor Contractor",
				size: "md",
			},
		});
	};

	// Show remove button if contractor is assigned, otherwise show assign button
	if (eventContractor && assignedContractor) {
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
