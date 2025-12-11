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
import type { PrintingService } from "@/lib/api/printing-service";
import { updatePrintingService } from "@/lib/api/printing-service";
import { PrintingServiceEditContent } from "../printing-service-edit-dialog";
import { DeletePrintingServiceContent } from "../delete-printing-service-dialog";

interface PrintingServiceActionsMenuProps {
	service: PrintingService;
}

export function PrintingServiceActionsMenu({ service }: PrintingServiceActionsMenuProps) {
	const { openDialog } = useDialog();
	const queryClient = useQueryClient();

	const toggleStatusMutation = useMutation({
		mutationFn: () =>
			updatePrintingService({
				id: service.id,
				name: service.name,
				description: service.description,
				unit_of_measure: service.unitOfMeasure,
				default_price: service.defaultPrice,
				status: service.status === "active" ? "inactive" : "active",
				item_category_id: service.itemCategoryId,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["printing-services"] });
			toast.success(
				`Service ${service.status === "active" ? "deactivated" : "activated"} successfully`,
			);
		},
		onError: (error: Error) => {
			toast.error("Failed to update service status", {
				description: error.message,
			});
		},
	});

	const handleEditClick = () => {
		openDialog({
			component: PrintingServiceEditContent,
			props: { service },
			config: {
				title: "Edit Printing Service",
				description: "Update printing service details.",
				size: "lg",
			},
		});
	};

	const handleDeleteClick = () => {
		openDialog({
			component: DeletePrintingServiceContent,
			props: { service },
			config: {
				title: "Delete Printing Service",
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
					Edit Service
				</DropdownMenuItem>
				<DropdownMenuItem
					className="rounded-none"
					onClick={() => toggleStatusMutation.mutate()}
					disabled={toggleStatusMutation.isPending}
				>
					<Power className="mr-2 h-4 w-4" />
					{service.status === "active" ? "Deactivate" : "Activate"}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleDeleteClick}
					className="rounded-none text-red-600"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Service
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
