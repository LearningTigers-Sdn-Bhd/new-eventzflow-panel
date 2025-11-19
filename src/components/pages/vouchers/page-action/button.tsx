"use client";

import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import AddVoucherForm from "../forms/add-voucher-form";

export function VouchersPageButton() {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();

	const handleAddVoucher = () => {
		openDialog({
			component: AddVoucherForm,
			props: {
				eventId: Number(eventId),
				onClose: closeDialog,
			},
			config: {
				title: "Create Voucher",
				description: "Create a new voucher for this event.",
				size: "full",
			},
		});
	};

	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button
				onClick={handleAddVoucher}
				className="w-full rounded-none lg:w-auto"
			>
				<Plus className="mr-2 h-4 w-4" />
				Add Voucher
			</Button>
		</div>
	);
}
