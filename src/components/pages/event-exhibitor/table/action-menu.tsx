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
import { useDialog } from "@/hooks/use-dialog";
import { deleteEventVendor } from "@/lib/api/event-vendor";
import type { EventVendor } from "@/lib/api/event-vendor";
import ConfirmDialog from "../../event-staff/confirm-dialog";
import EditEventVendorForm from "../../event-vendors/forms/edit-vendor/edit-form";
import { ManageKitsModal } from "../forms/manage-kits-modal";
import { ManageTeamMembersForm } from "../forms/manage-team-members-form";
import QrCodeDialog from "../../event-vendors/dialogs/qr-code-dialog";
import { getEventById } from "@/lib/api/event";

interface ExhibitorActionsMenuProps {
	exhibitor: EventVendor;
}

export function ExhibitorActionsMenu({ exhibitor }: ExhibitorActionsMenuProps) {
	const router = useRouter();
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();

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
				showPrintingServices: event?.allow_contractor_printing_services ?? false,
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
				size: "lg",
			},
		});
	};

	const handleDeleteClick = () => {
		openDialog({
			component: ConfirmDialog,
			props: {
				message: `Are you sure you want to remove ${exhibitor.vendor.full_name} from this event? They will no longer have access to this event's exhibitor functions.`,
				confirmLabel: "Remove",
				cancelLabel: "Cancel",
				variant: "destructive",
				icon: "delete",
				onConfirm: () => {
					deleteExhibitorMutation.mutate(exhibitor.id);
				},
				onCancel: closeDialog,
			},
			config: {
				title: "Remove Exhibitor",
				size: "sm",
			},
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
				className="rounded-none bg-background w-48"
			>
				<DropdownMenuItem
					onClick={handleEditClick}
					className="rounded-none cursor-pointer"
				>
					<Pencil className="mr-2 size-4" />
					Edit Form
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleManageKitsClick}
					className="rounded-none cursor-pointer"
				>
					<Package className="mr-2 size-4" />
					Manage Kits
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleViewExhibitorClick}
					className="rounded-none cursor-pointer"
				>
					<Eye className="mr-2 size-4" />
					View Exhibitor
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleQrCodeClick}
					className="rounded-none cursor-pointer"
				>
					<QrCode className="mr-2 size-4" />
					QR Code
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleManageMemberClick}
					className="rounded-none cursor-pointer"
				>
					<Users className="mr-2 size-4" />
					Manage Member
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleDeleteClick}
					className="rounded-none cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
				>
					<Trash2 className="mr-2 size-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
