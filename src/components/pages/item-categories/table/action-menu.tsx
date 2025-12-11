"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2, Power } from "lucide-react";
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
import { useDialog } from "@/hooks/use-dialog";
import type { ItemCategory } from "@/lib/api/item-category";
import { updateItemCategory } from "@/lib/api/item-category";
import { CategoryEditContent } from "../category-edit-dialog";
import { DeleteCategoryContent } from "../delete-category-dialog";

interface CategoryActionsMenuProps {
	category: ItemCategory;
}

export function CategoryActionsMenu({ category }: CategoryActionsMenuProps) {
	const { openDialog } = useDialog();
	const queryClient = useQueryClient();

	const toggleStatusMutation = useMutation({
		mutationFn: () =>
			updateItemCategory({
				id: category.id,
				name: category.name,
				active: !category.active,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["item-categories"] });
			toast.success(
				`Category ${category.active ? "deactivated" : "activated"} successfully`,
			);
		},
		onError: (error: Error) => {
			toast.error("Failed to update category status", {
				description: error.message,
			});
		},
	});

	const handleEditClick = () => {
		openDialog({
			component: CategoryEditContent,
			props: { category },
			config: {
				title: "Edit Category",
				description: "Update item category details.",
				size: "sm",
			},
		});
	};

	const handleDeleteClick = () => {
		openDialog({
			component: DeleteCategoryContent,
			props: { category },
			config: {
				title: "Delete Category",
				size: "sm",
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 rounded-none p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" side="left" className="rounded-none">
				<DropdownMenuLabel className="rounded-none">Actions</DropdownMenuLabel>
				<DropdownMenuSeparator className="rounded-none" />
				<DropdownMenuItem className="rounded-none" onClick={handleEditClick}>
					<Pencil className="mr-2 h-4 w-4" />
					Edit Category
				</DropdownMenuItem>
				<DropdownMenuItem
					className="rounded-none"
					onClick={() => toggleStatusMutation.mutate()}
					disabled={toggleStatusMutation.isPending}
				>
					<Power className="mr-2 h-4 w-4" />
					{category.active ? "Deactivate" : "Activate"}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleDeleteClick}
					className="rounded-none text-red-600"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Category
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
