"use client";

import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useDialog } from "@/hooks/use-dialog";
import type { Vendor } from "@/lib/api/vendor";
import CreateVendorForm from "./dialogs/create-vendor-form";
import { DataTable } from "./table/vendors-table";

interface VendorClientWrapperProps {
	vendors: Vendor[];
	showHeader?: boolean;
}

export default function VendorClientWrapper({
	vendors,
	showHeader = true,
}: VendorClientWrapperProps) {
	const { openDialog, closeDialog } = useDialog();

	// Sort by createdAt in descending order (latest first)
	const sortedVendors = vendors.sort((a, b) => {
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	const handleAddVendor = () => {
		openDialog({
			component: CreateVendorForm,
			props: {
				onClose: closeDialog,
			},
			config: {
				title: "Add Vendor",
				description: "Create a new vendor account with profile details",
				size: "full",
				showCloseButton: true,
			},
		});
	};

	return (
		<div className="p-0">
			{showHeader && (
				<div className="page-header mb-6">
					<div className="px-2 md:px-4">
						<IconTitle
							icon={Store}
							title="Vendors"
							description="Manage your vendors and their profiles."
						/>
					</div>
					<div className="w-full px-0 md:w-auto md:px-4">
						<Button
							onClick={handleAddVendor}
							className="w-full shrink-0 rounded-none"
						>
							Add Vendor
						</Button>
					</div>
				</div>
			)}
			<DataTable data={sortedVendors} onAddVendor={handleAddVendor} />
		</div>
	);
}
