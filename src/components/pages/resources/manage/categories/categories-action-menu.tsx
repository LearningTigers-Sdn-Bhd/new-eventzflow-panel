"use client";

import { Archive, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useDialog } from "@/hooks/use-dialog";
import { useResourceMutations } from "@/hooks/resources/use-resource-mutations";
import {
	deleteResourceCategory,
	forceDeleteResourceCategory,
	restoreResourceCategory,
} from "@/lib/api/resource/category";
import type { ResourceCategory } from "@/lib/api/resource/category/response";
import { EditCategoriesForm } from "./form-modals/edit-categories-form";

interface CategoriesActionMenuProps {
	category: ResourceCategory;
}

export function CategoriesActionMenu({ category }: CategoriesActionMenuProps) {
	const { openDialog } = useDialog();

	const { handleArchive, handleDelete, handleRestore } = useResourceMutations({
		resourceName: "Category",
		queryKey: ["resource-categories"],
		archiveFn: deleteResourceCategory,
		deleteFn: forceDeleteResourceCategory,
		restoreFn: restoreResourceCategory,
	});

	const isDeleted = !!category.deletedAt;

	const handleEdit = () => {
		openDialog({
			component: EditCategoriesForm,
			props: { category },
			config: {
				title: "Edit Category",
				description: "Edit the details of the category.",
				size: "lg",
			},
		});
	};

	return (
		<ButtonGroup>
			{!isDeleted && (
				<>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
						onClick={handleEdit}
						title="Edit Category"
					>
						<Pencil className="size-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-amber-500 hover:bg-amber-50 hover:text-amber-600 [&_svg]:text-amber-500 hover:[&_svg]:text-amber-600"
						onClick={() => handleArchive(category.id)}
						title="Archive Category"
					>
						<Archive className="size-4" />
					</Button>
				</>
			)}

			{isDeleted && (
				<>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-green-500 hover:bg-green-50 hover:text-green-600 [&_svg]:text-green-500 hover:[&_svg]:text-green-600"
						onClick={() => handleRestore(category.id)}
						title="Restore Category"
					>
						<RotateCcw className="size-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
						onClick={() => handleDelete(category.id)}
						title="Delete Permanently"
					>
						<Trash2 className="size-4" />
					</Button>
				</>
			)}
		</ButtonGroup>
	);
}
