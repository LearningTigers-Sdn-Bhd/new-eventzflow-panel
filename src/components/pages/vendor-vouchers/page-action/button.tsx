"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import AddVendorVoucherForm from "../forms/add-vendor-voucher-form";

export function VendorVouchersPageButton() {
	const { openDialog, closeDialog } = useDialog();

	const handleAddVoucher = () => {
		openDialog({
			component: AddVendorVoucherForm,
			props: {
				onClose: closeDialog,
			},
			config: {
				title: "Create Voucher",
				description: "Create a new voucher for one of your events.",
				size: "full",
			},
		});
	};

	return (
		<Button onClick={handleAddVoucher} className="w-full shrink-0 rounded-none">
			<Plus className="mr-2 size-4" />
			Create Voucher
		</Button>
	);
}
