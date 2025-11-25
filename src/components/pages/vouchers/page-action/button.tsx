"use client";

import { Eye, Plus } from "lucide-react";
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

	const handleViewShowcase = () => {
		window.open(`/event/${eventId}/voucher-showcase`, "_blank");
	};

	return (
		<div className="flex w-full items-center gap-2 lg:w-auto">
			<Button
				variant="outline"
				className="w-full rounded-none lg:w-auto"
				onClick={handleViewShowcase}
			>
				<Eye className="mr-2 h-4 w-4" />
				View Showcase
			</Button>
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
