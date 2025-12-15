"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Eye,
	MoreHorizontal,
	Package,
	Pencil,
	QrCode,
	Trash2,
	Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { getEventById } from "@/lib/api/event";
import type { EventVendor } from "@/lib/api/event-vendor";
import { deleteEventVendor } from "@/lib/api/event-vendor";
import QrCodeDialog from "../../event-vendors/dialogs/qr-code-dialog";
import EditEventVendorForm from "../../event-vendors/forms/edit-vendor/edit-form";
import { ManageKitsModal } from "../forms/manage-kits-modal";
import { ManageTeamMembersForm } from "../forms/manage-team-members-form";

interface ExhibitorActionsMenuProps {
	exhibitor: EventVendor;
}

export function ExhibitorActionsMenu({ exhibitor }: ExhibitorActionsMenuProps) {
	const router = useRouter();
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();

	const queryClient = useQueryClient();

	const { data: event } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
	});
	const deleteExhibitorMutation = useMutation({
		mutationFn: (exhibitorId: number) =>
			deleteEventVendor(Number(eventId), exhibitorId),
		onSuccess: () => {
			toast.success("Exhibitor removed from event successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "vendors"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove exhibitor");
		},
	});

	const handleEditClick = () => {
		openDialog({
			component: EditEventVendorForm,
			props: {
				vendor: exhibitor,
			},
			config: {
				title: "Edit Exhibitor",
				size: "2xl",
			},
		});
	};

	const handleManageKitsClick = () => {
		if (!exhibitor.exhibitor_kit) {
			toast.error("No exhibitor kit found for this exhibitor");
			return;
		}
		openDialog({
			component: ManageKitsModal,
			props: {
				vendor: exhibitor,
				showPrintingServices:
					event?.allow_contractor_printing_services ?? false,
				onClose: closeDialog,
			},
			config: {
				title: "Manage Exhibitor Kit",
				size: "full",
			},
		});
	};

	const handleViewExhibitorClick = () => {
		// Use vendors route since profile page is shared
		router.push(`/event/${eventId}/vendors/${exhibitor.id}/profile`);
	};

	const handleQrCodeClick = () => {
		openDialog({
			component: QrCodeDialog,
			props: {
				vendor: exhibitor,
			},
			config: {
				title: "QR Code",
				size: "lg",
			},
		});
	};

	const handleManageMemberClick = () => {
		if (!exhibitor.exhibitor_kit) {
			toast.error("No exhibitor kit found for this exhibitor");
			return;
		}
		openDialog({
			component: ManageTeamMembersForm,
			props: {
				vendor: exhibitor,
				onClose: closeDialog,
			},
			config: {
				title: "Manage Team Members",
				description: "Add, edit, or remove team members for this exhibitor",
				size: "full",
			},
		});
	};

	const handleDeleteClick = () => {
		openConfirm({
			title: "Remove Exhibitor",
			message: `Are you sure you want to remove ${exhibitor.vendor.full_name} from this event? They will no longer have access to this event's exhibitor functions.`,
			confirmLabel: "Remove",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			size: "sm",
			onConfirm: () => {
				deleteExhibitorMutation.mutate(exhibitor.id);
			},
			onCancel: closeDialog,
		});
	};

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon-sm" className="rounded-none">
					<MoreHorizontal className="size-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-48 rounded-none bg-background"
			>
				<DropdownMenuItem
					onClick={handleEditClick}
					className="cursor-pointer rounded-none"
				>
					<Pencil className="mr-2 size-4" />
					Edit Form
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleManageKitsClick}
					className="cursor-pointer rounded-none"
				>
					<Package className="mr-2 size-4" />
					Manage Kits
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleViewExhibitorClick}
					className="cursor-pointer rounded-none"
				>
					<Eye className="mr-2 size-4" />
					View Exhibitor
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleQrCodeClick}
					className="cursor-pointer rounded-none"
				>
					<QrCode className="mr-2 size-4" />
					QR Code
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleManageMemberClick}
					className="cursor-pointer rounded-none"
				>
					<Users className="mr-2 size-4" />
					Manage Member
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleDeleteClick}
					className="cursor-pointer rounded-none text-red-600 focus:bg-red-50 focus:text-red-600"
				>
					<Trash2 className="mr-2 size-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
