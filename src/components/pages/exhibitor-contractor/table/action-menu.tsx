"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2, Power, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/hooks/use-dialog";
import type { ExhibitionContractor } from "@/lib/api/contractor";
import { toggleContractorStatus } from "@/lib/api/contractor";
import { ContractorEditContent } from "../contractor-edit-dialog";
import { DeleteContractorContent } from "../delete-contractor-dialog";
import { AssignToEventDialog } from "../assign-to-event-dialog";

interface ContractorActionsMenuProps {
	contractor: ExhibitionContractor;
}

export function ContractorActionsMenu({
	contractor,
}: ContractorActionsMenuProps) {
	const { openDialog } = useDialog();
	const queryClient = useQueryClient();

	const toggleStatusMutation = useMutation({
		mutationFn: () =>
			toggleContractorStatus(contractor.id, {
				status: contractor.status === "active" ? "inactive" : "active",
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contractors"] });
			toast.success(
				`Contractor ${contractor.status === "active" ? "deactivated" : "activated"} successfully`,
			);
		},
		onError: (error: Error) => {
			toast.error("Failed to update contractor status", {
				description: error.message,
			});
		},
	});

	const handleEditClick = () => {
		openDialog({
			component: ContractorEditContent,
			props: { contractor },
			config: {
				title: "Edit Contractor",
				description: "Update exhibition contractor details.",
				size: "2xl",
			},
		});
	};

	const handleAssignToEventClick = () => {
		openDialog({
			component: AssignToEventDialog,
			props: { contractor },
			config: {
				title: "Assign to Event",
				description: `Manage event assignments for ${contractor.full_name}`,
				size: "lg",
			},
		});
	};

	const handleDeleteClick = () => {
		openDialog({
			component: DeleteContractorContent,
			props: { contractor },
			config: {
				title: "Delete Contractor",
				size: "sm",
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 rounded-none p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" side="left" className="rounded-none">
				<DropdownMenuLabel className="rounded-none">Actions</DropdownMenuLabel>
				<DropdownMenuSeparator className="rounded-none" />
				<DropdownMenuItem className="rounded-none" onClick={handleEditClick}>
					<Pencil className="mr-2 h-4 w-4" />
					Edit Contractor
				</DropdownMenuItem>
				<DropdownMenuItem className="rounded-none" onClick={handleAssignToEventClick}>
					<CalendarPlus className="mr-2 h-4 w-4" />
					Assign to Event
				</DropdownMenuItem>
				<DropdownMenuItem
					className="rounded-none"
					onClick={() => toggleStatusMutation.mutate()}
					disabled={toggleStatusMutation.isPending}
				>
					<Power className="mr-2 h-4 w-4" />
					{contractor.status === "active" ? "Deactivate" : "Activate"}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleDeleteClick}
					className="rounded-none text-red-600"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Contractor
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
