"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Archive,
	Edit,
	MoreVertical,
	QrCode,
	RotateCcw,
	Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
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
import { useAuth } from "@/hooks/auth/use-auth";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import {
	archiveVoucher,
	forceDeleteVoucher,
	restoreVoucher,
} from "@/lib/api/voucher";
import EditVoucherForm from "../forms/edit-voucher-form";
import VoucherQRDialog from "../voucher-qr-dialog";
import type { Voucher } from "./event-voucher-table-columns";

interface VoucherActionsMenuProps {
	voucher: Voucher;
}

export function VoucherActionsMenu({ voucher }: VoucherActionsMenuProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const isArchived = !!voucher.deletedAt;
	const canDeletePermanently = user?.role === "org_owner";

	const refresh = () =>
		queryClient.invalidateQueries({
			queryKey: ["event", eventId, "vouchers"],
		});

	const archiveMutation = useMutation({
		mutationFn: () => archiveVoucher({ id: voucher.id }),
		onSuccess: () => {
			toast.success("Voucher archived");
			refresh();
		},
		onError: (error: Error) =>
			toast.error(error.message || "Failed to archive voucher"),
	});

	const restoreMutation = useMutation({
		mutationFn: () => restoreVoucher({ id: voucher.id }),
		onSuccess: () => {
			toast.success("Voucher restored");
			refresh();
		},
		onError: (error: Error) =>
			toast.error(error.message || "Failed to restore voucher"),
	});

	const deleteMutation = useMutation({
		mutationFn: () => forceDeleteVoucher({ id: voucher.id }),
		onSuccess: () => {
			toast.success("Voucher deleted permanently");
			refresh();
		},
		onError: (error: Error) =>
			toast.error(error.message || "Failed to delete voucher"),
	});

	const handleArchive = () => {
		openConfirm({
			title: "Archive Voucher",
			message: `Archive "${voucher.title}"? It can no longer be redeemed or shown in the showcase. You can restore it anytime from the Archived view.`,
			confirmLabel: "Archive",
			cancelLabel: "Cancel",
			type: "warning",
			icon: "alert",
			size: "sm",
			onConfirm: () => archiveMutation.mutate(),
			onCancel: closeDialog,
		});
	};

	const handleRestore = () => {
		openConfirm({
			title: "Restore Voucher",
			message: `Restore "${voucher.title}"? It will be back in the main list with its previous status.`,
			confirmLabel: "Restore",
			cancelLabel: "Cancel",
			type: "success",
			icon: "check",
			size: "sm",
			onConfirm: () => restoreMutation.mutate(),
			onCancel: closeDialog,
		});
	};

	const handleDeletePermanently = () => {
		openConfirm({
			title: "Delete Voucher Permanently",
			message: `Permanently delete "${voucher.title}"? Its redemption history is deleted with it. This cannot be undone.`,
			confirmLabel: "Delete Permanently",
			cancelLabel: "Cancel",
			type: "destructive",
			icon: "delete",
			size: "sm",
			onConfirm: () => deleteMutation.mutate(),
			onCancel: closeDialog,
		});
	};

	const handleEdit = () => {
		openDialog({
			component: EditVoucherForm,
			props: {
				eventId: Number(eventId),
				voucher: voucher,
				onClose: closeDialog,
			},
			config: {
				title: "Edit Voucher",
				description: "Update voucher details and settings.",
				size: "full",
			},
		});
	};

	const handleShowQR = () => {
		openDialog({
			component: VoucherQRDialog,
			props: {
				voucher: voucher,
				onClose: closeDialog,
			},
			config: {
				title: "Voucher QR Code",
				description: `Scan this QR code to redeem ${voucher.title}`,
				size: "sm",
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-none">
					<MoreVertical className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="rounded-none bg-background">
				<DropdownMenuLabel className="rounded-none">Actions</DropdownMenuLabel>
				<DropdownMenuSeparator className="rounded-none" />
				{isArchived ? (
					<>
						<DropdownMenuItem onClick={handleRestore} className="rounded-none">
							<RotateCcw className="mr-2 h-4 w-4" />
							Restore Voucher
						</DropdownMenuItem>
						{canDeletePermanently && (
							<DropdownMenuItem
								onClick={handleDeletePermanently}
								className="rounded-none text-destructive focus:text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Permanently
							</DropdownMenuItem>
						)}
					</>
				) : (
					<>
						<DropdownMenuItem onClick={handleEdit} className="rounded-none">
							<Edit className="mr-2 h-4 w-4" />
							Edit Voucher
						</DropdownMenuItem>
						<DropdownMenuItem onClick={handleShowQR} className="rounded-none">
							<QrCode className="mr-2 h-4 w-4" />
							Show QR Code
						</DropdownMenuItem>
						<DropdownMenuItem onClick={handleArchive} className="rounded-none">
							<Archive className="mr-2 h-4 w-4" />
							Archive Voucher
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
