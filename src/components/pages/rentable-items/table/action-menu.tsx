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
import type { RentableItem } from "@/lib/api/rentable-item";
import { updateRentableItem } from "@/lib/api/rentable-item";
import { RentableItemEditContent } from "../rentable-item-edit-dialog";
import { DeleteRentableItemContent } from "../delete-rentable-item-dialog";

interface RentableItemActionsMenuProps {
	item: RentableItem;
}

export function RentableItemActionsMenu({ item }: RentableItemActionsMenuProps) {
	const { openDialog } = useDialog();
	const queryClient = useQueryClient();

	const toggleStatusMutation = useMutation({
		mutationFn: () =>
			updateRentableItem({
				id: item.id,
				name: item.name,
				description: item.description,
				unit_of_measure: item.unitOfMeasure,
				default_price: item.defaultPrice,
				status: item.status === "active" ? "inactive" : "active",
				item_category_id: item.itemCategoryId,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["rentable-items"] });
			toast.success(
				`Item ${item.status === "active" ? "deactivated" : "activated"} successfully`,
			);
		},
		onError: (error: Error) => {
			toast.error("Failed to update item status", {
				description: error.message,
			});
		},
	});

	const handleEditClick = () => {
		openDialog({
			component: RentableItemEditContent,
			props: { item },
			config: {
				title: "Edit Rentable Item",
				description: "Update rentable item details.",
				size: "lg",
			},
		});
	};

	const handleDeleteClick = () => {
		openDialog({
			component: DeleteRentableItemContent,
			props: { item },
			config: {
				title: "Delete Rentable Item",
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
					Edit Item
				</DropdownMenuItem>
				<DropdownMenuItem
					className="rounded-none"
					onClick={() => toggleStatusMutation.mutate()}
					disabled={toggleStatusMutation.isPending}
				>
					<Power className="mr-2 h-4 w-4" />
					{item.status === "active" ? "Deactivate" : "Activate"}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleDeleteClick}
					className="rounded-none text-red-600"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Item
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
