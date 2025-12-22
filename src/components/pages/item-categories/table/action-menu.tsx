"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import type { ItemCategory } from "@/lib/api/item-category";
import {
	deleteItemCategory,
	updateItemCategory,
} from "@/lib/api/item-category";
import { CategoryEditContent } from "../category-edit-dialog";

interface CategoryActionsMenuProps {
	category: ItemCategory;
}

export function CategoryActionsMenu({ category }: CategoryActionsMenuProps) {
	const { openDialog, closeDialog } = useDialog();
	const { openConfirm } = useConfirmDialog();
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
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to update category status", {
				description: error.message,
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteItemCategory({ id: category.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["item-categories"] });
			toast.success("Category deleted successfully");
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to delete category", {
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
		openConfirm({
			title: "Delete Category",
			message: `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`,
			confirmLabel: "Delete",
			cancelLabel: "Cancel",
			type: "destructive",
			rounded: "no-rounded",
			icon: "delete",
			size: "sm",
			onConfirm: () => {
				deleteMutation.mutate();
			},
		});
	};

	const handleToggleStatusClick = () => {
		const action = category.active ? "deactivate" : "activate";
		openConfirm({
			title: `${action.charAt(0).toUpperCase() + action.slice(1)} Category`,
			message: `Are you sure you want to ${action} this category?`,
			confirmLabel: action.charAt(0).toUpperCase() + action.slice(1),
			cancelLabel: "Cancel",
			type: category.active ? "warning" : "success",
			rounded: "no-rounded",
			icon: category.active ? "alert" : "check",
			size: "sm",
			onConfirm: () => {
				toggleStatusMutation.mutate();
			},
		});
	};

	return (
		<TooltipProvider delayDuration={0}>
			<ButtonGroup>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="rounded-none"
							onClick={handleEditClick}
						>
							<Pencil className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">Edit Category</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="rounded-none"
							onClick={handleToggleStatusClick}
						>
							<Power
								className={`h-4 w-4 ${category.active ? "text-amber-500" : "text-emerald-500"}`}
							/>
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						{category.active ? "Deactivate" : "Activate"}
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="rounded-none text-red-600 hover:text-red-600"
							onClick={handleDeleteClick}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">Delete Category</TooltipContent>
				</Tooltip>
			</ButtonGroup>
		</TooltipProvider>
	);
}
