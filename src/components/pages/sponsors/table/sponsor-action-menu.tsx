"use client";

import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmationDialog from "@/components/dialogs/delete-confirmation-dialog";
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
import { useDeleteSponsor } from "@/hooks/use-sponsorships";
import type { Sponsor } from "@/lib/api/sponsorship/response";
import EditSponsorForm from "../forms/edit-sponsor-form";

interface SponsorActionMenuProps {
	sponsor: Sponsor;
}

export function SponsorActionMenu({ sponsor }: SponsorActionMenuProps) {
	const { openDialog, closeDialog } = useDialog();
	const deleteMutation = useDeleteSponsor();

	const handleEdit = () => {
		openDialog({
			component: EditSponsorForm,
			props: {
				sponsor,
				onClose: closeDialog,
			},
			config: {
				title: "Edit Sponsor",
				description: "Update sponsor details",
				size: "2xl",
				showCloseButton: true,
			},
		});
	};

	const handleDelete = () => {
		openDialog({
			component: DeleteConfirmationDialog,
			props: {
				title: "Delete Sponsor",
				description: `Are you sure you want to permanently delete the sponsor "${sponsor.name}"? This will also affect any associated sponsorships.`,
				isPending: deleteMutation.isPending,
				onClose: closeDialog,
				onConfirm: async () => {
					try {
						await deleteMutation.mutateAsync(sponsor.id.toString());
						toast.success("Sponsor deleted successfully");
						closeDialog();
					} catch (error: any) {
						toast.error(error.message || "Failed to delete sponsor");
					}
				},
			},
			config: { showCloseButton: false },
		});
	};

	const handleView = () => {
		window.location.href = `/sponsors/${sponsor.id}`;
	};

	return (
		<div className="flex items-center justify-end">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem onClick={handleView}>
						<Eye className="mr-2 h-4 w-4" />
						View Details
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleEdit}>
						<Pencil className="mr-2 h-4 w-4" />
						Edit Sponsor
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleDelete}
						className="text-destructive focus:text-destructive"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
