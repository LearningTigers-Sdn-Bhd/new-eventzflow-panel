"use client";

import { FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useDialog } from "@/hooks/use-dialog";
import type { ItemCategory } from "@/lib/api/item-category";
import { columns } from "./table/columns";
import { DataTable } from "./table/data-table";
import { CategoryFormContent } from "./category-form-dialog";

interface CategoryClientWrapperProps {
	categories: ItemCategory[];
	isLoading?: boolean;
	error?: Error | null;
	showHeader?: boolean;
}

export default function CategoryClientWrapper({
	categories,
	isLoading = false,
	error = null,
	showHeader = true,
}: CategoryClientWrapperProps) {
	const { openDialog } = useDialog();

	// Sort by created_at in descending order (latest first)
	const sortedCategories = [...categories].sort((a, b) => {
		if (!a.createdAt || !b.createdAt) return 0;
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	const handleAddCategory = () => {
		openDialog({
			component: CategoryFormContent,
			props: {},
			config: {
				title: "Add Category",
				description: "Create a new item category.",
				size: "sm",
			},
		});
	};

	if (error) {
		return (
			<div className="flex h-[50vh] flex-col items-center justify-center text-center">
				<FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
				<h3 className="mb-2 font-semibold text-lg">
					Failed to load categories
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
							icon={FolderOpen}
							title="Item Categories"
							description="Manage categories for rentable items and printing services."
						/>
					</div>
					<div className="w-full px-0 md:w-auto md:px-4">
						<Button
							onClick={handleAddCategory}
							className="w-full shrink-0 rounded-none"
						>
							Add Category
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
					data={sortedCategories}
					onAddCategory={handleAddCategory}
				/>
			)}
		</div>
	);
}
