"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	CreditCard,
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
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import type { EventVendor } from "@/lib/api/event-vendor";
import { deleteExhibitorKit, type ExhibitorKit } from "@/lib/api/exhibitor-kit";
import QrCodeDialog from "../../event-vendors/dialogs/qr-code-dialog";
import EditEventVendorForm from "../../event-vendors/forms/edit-vendor/edit-form";
import { ManageKitsModal } from "../forms/manage-kits-modal";
import { ManagePaymentForm } from "../forms/manage-payment-form";
import { ManageTeamMembersForm } from "../forms/manage-team-members-form";

interface ExhibitorActionsMenuProps {
	exhibitor: EventVendor;
	kit: ExhibitorKit;
}

export function ExhibitorActionsMenu({
	exhibitor,
	kit,
}: ExhibitorActionsMenuProps) {
	const router = useRouter();
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();

	const queryClient = useQueryClient();

	const deleteKitMutation = useMutation({
		mutationFn: (kitId: number) => deleteExhibitorKit(Number(eventId), kitId),
		onSuccess: () => {
			toast.success("Exhibitor kit cancelled successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "vendors"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to cancel exhibitor kit");
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
		openDialog({
			component: ManageKitsModal,
			props: {
				vendor: exhibitor,
				kitId: kit.id,
				showPrintingServices: true, // org_owner always sees printing services
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
		openDialog({
			component: ManageTeamMembersForm,
			props: {
				vendor: exhibitor,
				kitId: kit.id,
				onClose: closeDialog,
			},
			config: {
				title: "Manage Team Members",
				description: "Add, edit, or remove team members for this exhibitor",
				size: "full",
			},
		});
	};

	const handleManagePaymentClick = () => {
		openDialog({
			component: ManagePaymentForm,
			props: {
				vendor: exhibitor,
				kitId: kit.id,
				onClose: closeDialog,
			},
			config: {
				title: "Manage Payment",
				description: "Update payment status, amount paid, and notes",
				size: "md",
			},
		});
	};

	const handleDeleteClick = () => {
		openConfirm({
			title: "Cancel Exhibitor Kit",
			message: `Are you sure you want to cancel this kit for ${exhibitor.vendor.full_name}? Other kits and the vendor account will remain.`,
			confirmLabel: "Cancel Kit",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			size: "sm",
			onConfirm: () => {
				deleteKitMutation.mutate(kit.id);
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
				<DropdownMenuLabel className="rounded-none">Actions</DropdownMenuLabel>
				<DropdownMenuSeparator />
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
					onClick={handleManagePaymentClick}
					className="cursor-pointer rounded-none"
				>
					<CreditCard className="mr-2 size-4" />
					Manage Payment
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
					Cancel Kit
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
