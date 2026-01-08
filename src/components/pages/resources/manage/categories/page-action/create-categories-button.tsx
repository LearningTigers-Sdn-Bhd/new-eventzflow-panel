"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { CreateCategoriesForm } from "../form-modals/create-categories-form";

export function CreateCategoriesButton() {
	const { openDialog } = useDialog();

	const handleOpen = () => {
		openDialog({
			component: CreateCategoriesForm,
			config: {
				title: "Create Category",
				description: "Add a new category for resources.",
				size: "lg",
			},
		});
	};

	return (
		<Button onClick={handleOpen} className="w-full rounded-none md:w-auto">
			<Plus className="mr-2 h-4 w-4" />
			Create Category
		</Button>
	);
}
