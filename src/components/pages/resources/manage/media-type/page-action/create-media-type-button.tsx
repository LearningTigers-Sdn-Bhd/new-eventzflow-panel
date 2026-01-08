"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { CreateMediaTypeForm } from "../form-modals/create-media-type-form";

export function CreateMediaTypeButton() {
	const { openDialog } = useDialog();

	const handleOpen = () => {
		openDialog({
			component: CreateMediaTypeForm,
			config: {
				title: "Create Media Type",
				description: "Add a new media type for resources.",
				size: "lg",
			},
		});
	};

	return (
		<Button onClick={handleOpen} className="w-full rounded-none md:w-auto">
			<Plus className="mr-2 h-4 w-4" />
			Create Media Type
		</Button>
	);
}
