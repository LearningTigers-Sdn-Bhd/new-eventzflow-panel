"use client";

import { Edit, MoreVertical, QrCode } from "lucide-react";
import { useParams } from "next/navigation";
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
				<DropdownMenuItem onClick={handleEdit} className="rounded-none">
					<Edit className="mr-2 h-4 w-4" />
					Edit Voucher
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleShowQR} className="rounded-none">
					<QrCode className="mr-2 h-4 w-4" />
					Show QR Code
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
