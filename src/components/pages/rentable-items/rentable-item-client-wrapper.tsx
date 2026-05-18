"use client";

import { Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useDialog } from "@/hooks/use-dialog";
import type { RentableItem } from "@/lib/api/rentable-item";
import { RentableItemFormContent } from "./rentable-item-form-dialog";
import { columns } from "./table/columns";
import { DataTable } from "./table/data-table";

interface RentableItemClientWrapperProps {
	items: RentableItem[];
	isLoading?: boolean;
	error?: Error | null;
	showHeader?: boolean;
}

export default function RentableItemClientWrapper({
	items,
	isLoading = false,
	error = null,
	showHeader = true,
}: RentableItemClientWrapperProps) {
	const { openDialog } = useDialog();

	// Sort by created_at in descending order (latest first)
	const sortedItems = [...items].sort((a, b) => {
		if (!a.createdAt || !b.createdAt) return 0;
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	const handleAddItem = () => {
		openDialog({
			component: RentableItemFormContent,
			props: {},
			config: {
				title: "Add Rentable Item",
				description: "Create a new rentable item for your catalog.",
				size: "lg",
			},
		});
	};

	if (error) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<Package className="mb-4 h-12 w-12 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-lg">
					Failed to load rentable items
				</h3>
				<p className="text-muted-foreground text-sm">{error.message}</p>
			</div>
		);
	}

	return (
		<div className="p-0">
			{showHeader && (
				<div className="page-header mb-6">
					<div className="px-2 md:px-4">
						<IconTitle
							icon={Package}
							title="Rentable Items"
							description="Manage your catalog of rentable items for events."
						/>
					</div>
					<div className="w-full px-0 md:w-auto md:px-4">
						<Button
							onClick={handleAddItem}
							className="w-full shrink-0 rounded-none"
						>
							Add Item
						</Button>
					</div>
				</div>
			)}
			{isLoading ? (
				<div className="flex h-[50vh] items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<DataTable
					columns={columns}
					data={sortedItems}
					onAddItem={handleAddItem}
				/>
			)}
		</div>
	);
}
